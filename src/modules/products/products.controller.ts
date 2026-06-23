import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product-dto';
import type { Response } from 'express';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService
  ) { }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Lista de productos obtenida exitosamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  @Get()
  async findAll(@Res() res: Response) {
    const products = await this.productsService.findAll();
    return res.status(200).json(products);
  }

  @ApiBearerAuth()
  @ApiBody({
    description: 'Crea un nuevo producto',
    type: CreateProductDto,
  })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Mal enviado los datos de creación' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async createProduct(@Body() productData: CreateProductDto, @Res() res: Response) {
    const product = await this.productsService.create(productData);
    return res.status(201).json(product);
  }

  @ApiBearerAuth()
  @ApiBody({
    description: 'Crea varios productos al mismo tiempo',
    schema: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/CreateProductDto',
      },
    }
  })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Mal enviado los datos de creación' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  @UseGuards(JwtAuthGuard)
  @Post('bulk')
  async bulkCreate(@Body() productsData: CreateProductDto[], @Res() res: Response) {
    const products = await this.productsService.bulkCreate(productsData);
    return res.status(201).json(products);
  }
}