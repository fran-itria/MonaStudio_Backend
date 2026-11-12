import { Body, Controller, Get, Headers, Param, ParseUUIDPipe, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExcludeEndpoint, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import Create_order_dto from './dto/createOrder.dto';
import { AdminCreateOrderDto, UpdateOrderStatusDto } from './dto/admin-order.dto';
import { OrderSource, OrderStatus, PaymentStatus } from './entities/order.entity';
import type { Response } from 'express';
import { OrderServices } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly orderServices: OrderServices
  ) { }

  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, default: 1 })
  @ApiQuery({ name: 'limit', required: false, default: 20 })
  @ApiQuery({ name: 'state', required: false, enum: OrderStatus })
  @ApiQuery({ name: 'excludeState', required: false, enum: OrderStatus, description: 'Excluye ese estado (ej: rejected)' })
  @ApiQuery({ name: 'paymentStatus', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'delivered', required: false, description: 'cadete | retiro en local | acordar con vendedor' })
  @ApiQuery({ name: 'archived', required: false, description: 'true para ver las archivadas (por defecto false)' })
  @ApiQuery({ name: 'source', required: false, enum: OrderSource, description: 'web (tienda) o admin (cargada en el panel)' })
  @ApiQuery({ name: 'search', required: false, description: 'Nombre, apellido, teléfono o número de orden' })
  @ApiResponse({ status: 200, description: 'Lista paginada de órdenes con sus productos y variedades' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Res() res: Response,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('state') state?: string,
    @Query('excludeState') excludeState?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('delivered') delivered?: string,
    @Query('archived') archived?: string,
    @Query('source') source?: string,
    @Query('search') search?: string,
  ) {
    const orders = await this.orderServices.findAll({ page, limit, state, excludeState, paymentStatus, delivered, archived, source, search })
    res.status(200).json(orders)
  }

  @ApiBearerAuth()
  @ApiBody({ type: AdminCreateOrderDto })
  @ApiResponse({ status: 201, description: 'Orden cargada desde el panel (queda aceptada)' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @UseGuards(JwtAuthGuard)
  @Post('admin')
  async createFromAdmin(@Res() res: Response, @Body() body: AdminCreateOrderDto) {
    const { paymentStatus, ...order } = body
    const created = await this.orderServices.create(order, {
      state: OrderStatus.PAID,
      paymentStatus: paymentStatus ?? PaymentStatus.PENDING,
      source: OrderSource.ADMIN,
    })
    res.status(201).json(created)
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({ status: 200, description: 'Orden actualizada. Pasarla a "rejected" devuelve el stock (no se puede deshacer).' })
  @ApiResponse({ status: 400, description: 'Reabrir una orden rechazada o rechazar una entregada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateOrderStatusDto, @Res() res: Response) {
    const order = await this.orderServices.updateStatus(id, body)
    res.status(200).json(order)
  }

  @ApiBody({
    type: Create_order_dto
  })
  @ApiResponse({
    status: 200
  })
  @ApiResponse({
    status: 409,
    description: 'Error que indica que el stock de algún producto de la orden e sinsuficiente',
    example: {
      errorCode: "INSUFICIENT_STOCK",
      message: "No hay stock disponible de {producto} para completar su pedido, quedan {stock disponible} unidades disponible",
      status: 409,
      timestamp: "2026-07-31T04:37:44.892Z"
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Si método de entrega es cadete y no se mandan los datos de envío arroja este error',
    example: {
      errorCode: "BAD_REQUEST",
      message: "Los datos de envío son obligatorios",
      status: 400,
      timestamp: "2026-07-31T04:40:49.789Z"
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Si método de entrega es cadete y no se mandan los datos de envío arroja este error',
    example: {
      errorCode: "BAD_REQUEST",
      message: "Los datos de envío son obligatorios",
      status: 400,
      timestamp: "2026-07-31T04:40:49.789Z"
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Si se mandan más o menos cantidad de variedades de las que se debe elejir, arroja este error',
    example: {
      errorCode: "BAD_REQUEST",
      message: "Debes elegir 6 variedades",
      status: 400,
      timestamp: "2026-07-31T04:42:52.966Z"
    }
  })
  @Post()
  async create(@Res() res: Response, @Body() body: Create_order_dto) {
    const order = await this.orderServices.create(body)
    if (order)
      res.status(201).json(order)
  }

  @ApiBody({
    type: "object",
    schema: {
      example: {
        orderId: "id-de-la-orden"
      }
    }
  })
  @Post('/create-preference')
  async createPreference(@Body() { orderId }: { orderId: string }, @Res() res: Response): Promise<void> {
    const preference = await this.orderServices.createPreference(orderId)
    res.status(201).json({ init: preference.init_point, sandbox: preference.sandbox_init_point })
  }

  @ApiExcludeEndpoint()
  @Post('/webhook/mercadopago')
  async webhookMercadoPago(
    @Body() body: any,
    @Query() query: any,
    @Res() res: Response
  ): Promise<void> {

    const paymentId = body?.data?.id ?? query?.['data.id'] ?? body?.resource;
    if (!paymentId) {
      res.status(200).send('OK');
      return
    };

    const type = body?.type ?? query?.type;

    const webhook =
      await this.orderServices.registerMercadoPagoWebhook({
        providerEventId: body?.id ? String(body.id) : null,
        paymentId: String(paymentId),
        type,
        action: body?.action ?? null,
        payload: body
      });

    res.status(200).send('OK');

    await this.orderServices.processMercadoPagoWebhook(webhook.id)
  }
}
