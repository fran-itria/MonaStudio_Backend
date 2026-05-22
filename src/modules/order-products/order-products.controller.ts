import { Controller, Get } from '@nestjs/common';

@Controller('order-products')
export class OrderProductsController {
  @Get()
  getBase() {
    return { message: 'Order products controller' };
  }
}
