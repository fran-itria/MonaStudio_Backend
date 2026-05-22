# MonaStudio_Backend

Proyecto backend para la gestión de un negocio de maquillajes donde se ofrece una tienda de productos, servicios y cursos de automaquillaje.

## Stack

- NestJS + TypeScript
- TypeORM con PostgreSQL
- Autenticación con AuthGuard (login + JWT)

## Configuración

1. Copiar variables de entorno:

```bash
cp .env.example .env
```

2. Instalar dependencias:

```bash
npm install
```

3. Ejecutar en desarrollo:

```bash
npm run start:dev
```

## Documentación automática

### Swagger (NestJS)

- UI: `http://localhost:3000/api`
- JSON OpenAPI: `http://localhost:3000/api-json`

### Compodoc

Generar documentación:

```bash
npm run doc:compodoc
```

Generar y servir documentación:

```bash
npm run doc:compodoc:serve
```
