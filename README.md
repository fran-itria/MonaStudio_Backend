# MonaStudio — Backend

API REST que gestiona la tienda online de **MonaStudio**, un negocio de maquillaje que
vende productos, servicios y cursos de automaquillaje.

El backend resuelve el catálogo de productos (con variedades, imágenes y categorías),
el control de stock —incluido el de productos compuestos tipo *combo* o *2x1*—, la
creación de órdenes de compra y el cobro a través de **Mercado Pago**, con un sistema de
webhooks tolerante a fallos.

---

## Índice

- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Modelo de datos](#modelo-de-datos)
- [Módulos](#módulos)
- [Flujo de una orden](#flujo-de-una-orden)
- [Pagos con Mercado Pago](#pagos-con-mercado-pago)
- [Autenticación y seguridad](#autenticación-y-seguridad)
- [Manejo de errores](#manejo-de-errores)
- [Puesta en marcha](#puesta-en-marcha)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Documentación automática](#documentación-automática)
- [Endpoints principales](#endpoints-principales)

---

## Stack tecnológico

| Tecnología | Uso dentro del proyecto |
|---|---|
| **NestJS 11** | Framework principal. Organiza el código en módulos con inyección de dependencias. |
| **TypeScript 5** | Lenguaje base, con `strict` y decoradores habilitados. |
| **TypeORM** | ORM sobre PostgreSQL. Entidades por decoradores, relaciones, `QueryBuilder` y transacciones. |
| **PostgreSQL** (driver `pg`) | Base de datos relacional. Se aprovechan tipos propios: `uuid`, `jsonb`, `enum` y arrays de texto. |
| **@nestjs/config** | Carga de variables de entorno de forma global vía `ConfigService`. |
| **@nestjs/jwt** | Emisión y verificación de JSON Web Tokens para el panel de administración. |
| **bcryptjs** | Hasheo de contraseñas (10 salt rounds) y comparación en el login. |
| **class-validator / class-transformer** | Validación y transformación declarativa de los DTO mediante `ValidationPipe` global. |
| **@nestjs/swagger + swagger-ui-express** | Documentación OpenAPI generada desde los decoradores del código. |
| **mercadopago** (SDK oficial) | Creación de preferencias de pago y consulta de pagos. |
| **@nestjs/schedule** | Cron job horario que reprocesa webhooks pendientes. |
| **helmet** | Cabeceras HTTP de seguridad. |
| **Jest + Supertest** | Tests unitarios y end-to-end. |
| **ESLint + Prettier** | Linting y formateo. |
| **Compodoc** | Documentación estática de la arquitectura Nest. |

---

## Arquitectura

El proyecto sigue la arquitectura modular estándar de NestJS: cada dominio vive en
`src/modules/<dominio>` con su `module`, `controller`, `service`, `dto/` y `entities/`.

```
src/
├── main.ts                     # Bootstrap de la aplicación
├── configure-application.ts    # CORS, Helmet, prefijo, versionado, Swagger, ValidationPipe
├── app.module.ts               # Módulo raíz: config, scheduler, base de datos y dominios
├── config/
│   └── database-imports.ts     # Configuración asíncrona de TypeORM
├── Errors/                     # Catálogo de errores de dominio + excepción HTTP propia
└── modules/
    ├── auth/                   # Login JWT y guard de administrador
    ├── users/                  # Usuarios administradores
    ├── products/               # Catálogo, filtros, alta y actualización masiva
    ├── product-image/          # Imágenes de producto
    ├── categories/             # Categorías (N:M con productos)
    ├── varities/               # Variedades (ej. colores, tonos)
    ├── product-varity/         # Relación producto ↔ variedad con stock propio
    ├── varity-image/           # Imágenes por variedad
    ├── product-component/      # Composición de combos y packs
    ├── orders/                 # Creación de órdenes, preferencias y webhooks
    ├── order-products/         # Detalle de la orden (tabla intermedia)
    └── payment/                # Entidades de pago y de webhooks
```

### Configuración global (`configure-application.ts`)

- **Prefijo global** `api` y **versionado por URI** con versión por defecto `1`
  → todas las rutas quedan bajo `/api/v1/...`.
- **`ValidationPipe`** con `whitelist`, `forbidNonWhitelisted` y `transform`: se
  descartan propiedades no declaradas en los DTO y se rechaza el request si llegan
  campos desconocidos.
- **Helmet** y **CORS** habilitados.
- **Swagger** montado en el mismo prefijo, con autenticación Bearer declarada.

### Base de datos

`TypeOrmModule.forRootAsync` se configura desde `ConfigService`, con
`autoLoadEntities: true` y `synchronize` controlado por variable de entorno. Cuando
`NODE_ENV=test`, tanto la conexión a la base como los módulos de dominio se excluyen del
`AppModule`, de modo que los tests unitarios corren sin infraestructura.

---

## Modelo de datos

```
Product ──< ProductImage
   │
   ├──< ProductVarity >── Varity          (stock por variedad)
   │        └──< ProductVarityImage
   │
   ├──< ProductComponent ── component: Product   (composición de combos)
   │
   ├──>< Category                          (N:M vía product_categories)
   │
   └──< OrderProduct >── Order ──< Payment

Webhook   (registro independiente de notificaciones de Mercado Pago)
```

Entidades clave:

- **`Product`** (`productos`): nombre único, precio, precio con descuento, stock,
  descripción, flag `active`, secciones (`text[]`) y referencias a productos
  relacionados y complementarios en columnas `jsonb`.
- **`Varity`** (`varity`): variedad genérica y reutilizable, con nombre único.
- **`ProductVarity`** (`product_varity`): tabla puente producto ↔ variedad que guarda el
  **stock propio de esa combinación** y su flag `active`. Restricción de unicidad sobre
  el par `(product, varity)`.
- **`ProductComponent`** (`product_component`): describe de qué se compone un producto
  vendible. Permite modelar un "2x1" o un pack: define qué producto/variedad consume
  (`componentId`, `varityId`), cuánto stock descuenta (`stock_reduce`) y su
  `selection_mode`:
  - `FIXED`: la composición está determinada de antemano.
  - `CUSTOM`: el cliente elige `selection_quantity` variedades al comprar.
- **`Order`** (`orders`): datos del cliente, `order_number` autoincremental, monto,
  método de pago (`cash` / `transfer` / `card`), estado de pago
  (`pending` / `paid` / `failed`), estado de la orden
  (`pending` / `accept` / `rejected` / `delivered`), comentario y datos de envío en `jsonb`.
- **`OrderProduct`** (`order_products`): detalle con clave primaria compuesta
  `(orderId, productId, varityId)` y un `CHECK` que exige `quantity > 0`.
- **`Payment`** (`payments`): pago de Mercado Pago con `mercado_pago_id` único, importe y
  el payload completo del proveedor en `jsonb`.
- **`Webhook`** (`webhooks`): bitácora de notificaciones recibidas, con `status`,
  `retry_count`, `last_error`, `last_attempt_at` y `processed_at`.
- **`User`** (`usuarios`): usuario del panel, con contraseña hasheada y flag `isAdmin`.

---

## Módulos

### Products
Consulta paginada con `QueryBuilder`, filtrando por categoría y por estado de catálogo
(`inCatalog` / `outCatalog`), ordenando por un campo de una lista blanca
(`nombre`, `price`, `stock`, `discountedPrice`, `createdAt`) y dirección `ASC`/`DESC`.
El detalle por id carga categorías, imágenes, variedades y componentes, y calcula
`requiredSelections`: cuántas variedades debe elegir el cliente para ese producto.
Incluye alta individual, alta masiva, actualización individual, masiva y de stocks.

### Categories / Varities / Imágenes
CRUD de apoyo del catálogo. Categorías y variedades soportan creación masiva
(`bulk`), y las imágenes de producto y de variedad se cargan por lote.

### Auth / Users
Login por mail y contraseña que devuelve un `access_token`, endpoint de perfil protegido
y alta de usuarios con hasheo de contraseña.

### Orders
El núcleo transaccional del sistema: valida la orden, descuenta stock, calcula el importe
y persiste orden y detalle. También genera la preferencia de pago y procesa los webhooks.

---

## Flujo de una orden

`POST /api/v1/orders` ejecuta todo dentro de **una transacción de TypeORM**
(`DataSource.transaction`), de forma que un fallo en cualquier paso revierte los
descuentos de stock:

1. **Validaciones previas** (`create-order-errors.ts`): se exige método de entrega válido
   y, si es `cadete`, que lleguen los datos de envío.
2. **Descuento de stock** (`reduce-stock.ts`), por cada producto de la orden:
   - Se busca el producto; si no existe → `404`.
   - Si no tiene stock → `400 SOLD_OUT`; si la cantidad pedida supera el stock →
     `409 INSUFICIENT_STOCK` con el detalle de unidades disponibles.
   - Se valida la cantidad de variedades elegidas contra las que el producto requiere
     (`selectionMode` / `selectionQuantity`); si no coincide → `400` indicando cuántas
     debe elegir.
   - Se descuenta el stock del producto, el de cada `ProductVarity` seleccionada y el de
     los componentes asociados (`stock_reduce`).
3. **Cálculo del importe** (`calculatePrice.ts`): se usa el precio con descuento cuando
   existe, y si no el precio de lista, multiplicado por la cantidad.
4. **Persistencia**: se crea la `Order` y una fila de `OrderProduct` por producto y por
   variedad elegida.
5. Se devuelve la orden creada con estado `pending`.

---

## Pagos con Mercado Pago

### 1. Creación de la preferencia
`POST /api/v1/orders/create-preference` recibe el `orderId`, arma los ítems a partir del
detalle de la orden y crea una preferencia con el SDK oficial, indicando el
`external_reference` (el id de la orden) y la `notification_url` del webhook. Devuelve
`init_point` y `sandbox_init_point`.

### 2. Recepción del webhook
`POST /api/v1/orders/webhook/mercadopago` acepta el id del pago desde `body.data.id`,
`query['data.id']` o `body.resource`. La notificación se **persiste primero** en la tabla
`webhooks` con estado `pending`, se responde `200 OK` de inmediato —para no forzar
reintentos del proveedor— y recién después se procesa.

### 3. Procesamiento
- Se consulta la API de Mercado Pago para obtener el estado real del pago (nunca se
  confía en el payload de la notificación).
- Se **valida que el importe del pago coincida con el de la orden**; si difiere, el
  procesamiento falla y queda registrado.
- Dentro de una transacción se crea o actualiza el `Payment`, se marca la orden como
  pagada cuando el estado es `approved` + `accredited`, y se cierra el webhook como
  `completed`. Las operaciones son idempotentes: un webhook ya completado o fallido
  definitivamente se ignora.

### 4. Reintentos
`MercadoPagoWebhookCronService` corre **cada hora** (`@Cron(EVERY_HOUR)`), toma hasta 50
webhooks en estado `pending` con menos de 10 intentos, ordenados por fecha de recepción,
y los reprocesa. Cada fallo incrementa `retry_count` y guarda `last_error`; al llegar a
10 intentos el webhook pasa a `failed`.

---

## Autenticación y seguridad

- **Login**: `AuthService.validateUser` compara la contraseña con `bcryptjs` y `login`
  firma un JWT con el id y el mail del usuario.
- **`JwtAuthGuard`**: extrae el token del header `Authorization: Bearer <token>`, lo
  verifica, recarga el usuario desde la base y **exige `isAdmin`**. Protege todas las
  operaciones de escritura del catálogo (productos, categorías, variedades e imágenes).
- Los endpoints públicos son los de consulta del catálogo y los de compra.
- `helmet` aplica cabeceras de seguridad y el `ValidationPipe` global bloquea payloads
  con campos no declarados.

---

## Manejo de errores

`src/Errors/` centraliza el catálogo de errores del dominio (`product.errors.ts`,
`order.errors.ts`, `varity.errors.ts`, `category.errors.ts`, `lessons.errors.ts`) y
expone `ErrorsExceptions`, una `HttpException` propia con helpers
`notFound`, `badRequest`, `unauthorized` y `conflict`. Todas las respuestas de error
comparten la misma forma:

```json
{
  "errorCode": "INSUFICIENT_STOCK",
  "message": "No hay stock disponible de {producto} para completar su pedido, quedan {n} unidades disponible",
  "status": 409,
  "timestamp": "2026-07-31T04:37:44.892Z"
}
```

---

## Puesta en marcha

**Requisitos:** Node.js 20+, pnpm (o npm) y una instancia de PostgreSQL.

```bash
# 1. Instalar dependencias
pnpm install

# 2. Levantar en modo desarrollo (watch)
pnpm start:dev
```

La API queda disponible en `http://localhost:3000/api/v1` y la documentación en
`http://localhost:3000/api`.

Para producción:

```bash
pnpm build
pnpm start:prod
```

> Con `DB_SYNCHRONIZE=true` TypeORM sincroniza el esquema automáticamente. Es cómodo en
> desarrollo, pero en producción conviene desactivarlo y trabajar con migraciones.

---

## Scripts disponibles

| Script | Descripción |
|---|---|
| `pnpm start` | Inicia la aplicación. |
| `pnpm start:dev` | Modo desarrollo con recarga automática. |
| `pnpm start:debug` | Modo desarrollo con debugger. |
| `pnpm build` | Compila a `dist/`. |
| `pnpm start:prod` | Ejecuta la build compilada. |
| `pnpm test` | Tests unitarios (`NODE_ENV=test`). |
| `pnpm test:watch` / `test:cov` / `test:debug` | Watch, cobertura y debug de los tests. |
| `pnpm test:e2e` | Tests end-to-end. |
| `pnpm lint` | ESLint con `--fix`. |
| `pnpm format` | Prettier sobre `src/` y `test/`. |
| `pnpm docs:compodoc` | Genera la documentación estática. |
| `pnpm docs:compodoc:serve` | Genera y sirve la documentación. |

---

## Documentación automática

### Swagger

- UI: `http://localhost:3000/api`
- OpenAPI JSON: `http://localhost:3000/api-json`

Los controladores y DTO están anotados con `@ApiProperty`, `@ApiQuery`, `@ApiBody` y
`@ApiResponse`, incluyendo ejemplos de payloads y de respuestas de error.

### Compodoc

```bash
pnpm docs:compodoc        # genera en documentation/
pnpm docs:compodoc:serve  # genera y sirve
```

---

## Endpoints principales

Todos cuelgan del prefijo `/api/v1`. 🔒 indica que requiere JWT de administrador.

### Auth
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/auth/login` | Devuelve el `access_token`. |
| `GET` | `/auth/profile` 🔒 | Datos del usuario autenticado. |

### Users
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/users` | Crea un usuario. |
| `GET` | `/users` | Lista usuarios. |

### Products
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/products` | Listado con filtros `category`, `active`, `page`, `limit`, `orderBy`, `direction`. |
| `GET` | `/products/:id` | Detalle con categorías, imágenes, variedades, componentes y `requiredSelections`. |
| `POST` | `/products` 🔒 | Crea un producto. |
| `POST` | `/products/bulk` 🔒 | Alta masiva. |
| `PATCH` | `/products` 🔒 | Actualiza un producto. |
| `PATCH` | `/products/bulk` 🔒 | Actualización masiva. |
| `PATCH` | `/products/bulk-update-stocks` 🔒 | Actualización masiva de stocks. |

### Categories
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/categories` | Lista las categorías. |
| `POST` | `/categories` 🔒 | Crea una categoría. |
| `POST` | `/categories/bulk` 🔒 | Alta masiva. |
| `DELETE` | `/categories/:id` 🔒 | Elimina una categoría. |

### Varities e imágenes
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/varities` | Busca variedades por `name`. |
| `POST` | `/varities` 🔒 | Crea una variedad. |
| `POST` | `/varities/bulkCreate` 🔒 | Alta masiva. |
| `POST` | `/product-image` 🔒 | Carga por lote de imágenes de producto. |
| `POST` | `/varity-image` 🔒 | Carga por lote de imágenes de variedad. |

### Orders
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/orders` | Crea la orden, valida y descuenta stock. |
| `POST` | `/orders/create-preference` | Genera la preferencia de pago de Mercado Pago. |
| `POST` | `/orders/webhook/mercadopago` | Recibe las notificaciones de pago. |
