import { Controller, Get } from '@nestjs/common';

@Controller('categories')
export class CategoriesController {
  @Get()
  getBase() {
    return { message: 'Categories controller' };
  }
}
