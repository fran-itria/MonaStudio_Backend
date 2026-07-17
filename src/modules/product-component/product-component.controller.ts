import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductComponentService } from './product-component.service';
import { CreateProductComponentDto } from './dto/create-product-component.dto';

@Controller('product-component')
export class ProductComponentController {
  constructor(private readonly productComponentService: ProductComponentService) { }

  @Post()
  create(@Body() createProductComponentDto: CreateProductComponentDto) {
    return this.productComponentService.create(createProductComponentDto);
  }

  // @Get()
  // findAll() {
  //   return this.productComponentService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.productComponentService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateProductComponentDto) {
  //   return this.productComponentService.update(+id, updateProductComponentDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.productComponentService.remove(+id);
  // }
}
