import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import Create_order_dto from './dto/createOrder.dto';
import type { Response } from 'express';
import { OrderServices } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly orderServices: OrderServices
  ) { }

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
}
