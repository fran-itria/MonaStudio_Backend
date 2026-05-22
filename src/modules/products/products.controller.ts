import { Controller, Get } from '@nestjs/common';

@Controller('products')
export class ProductsController {
  @Get()
  getBase() {
    return { message: 'Products controller' };
  }
}
