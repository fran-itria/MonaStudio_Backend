import { Controller, Get } from '@nestjs/common';

@Controller('orders')
export class OrdersController {
  @Get()
  getBase() {
    return { message: 'Orders controller' };
  }
}
