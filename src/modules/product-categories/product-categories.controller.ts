import { Controller, Get } from '@nestjs/common';

@Controller('product-categories')
export class ProductCategoriesController {
  @Get()
  findAll() {
    return [];
  }
}
