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
  @Post()
  async create(@Res() res: Response, @Body() body: Create_order_dto) {
    const order = await this.orderServices.create(body)
    if (order)
      res.status(201).json(order)
  }
}
