import { Controller, Get } from '@nestjs/common';

@Controller('product-categories')
export class ProductCategoriesController {
  @Get()
  getBase() {
    return { message: 'Product categories controller' };
  }
}
