import { Body, Controller, Get, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product-dto';
import { UpdateProductDto } from './dto/update-product-dto';
import type { Response } from 'express';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService
  ) { }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'category',
    description: 'Nombre de la categoría para filtrar los productos',
    required: false
  })
  @ApiQuery({
    name: 'page',
    description: 'Número de página para la paginación (por defecto: 1)',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Cantidad de productos por página para la paginación (por defecto: 20)',
    required: false,
  })
  @ApiQuery({
    name: 'orderBy',
    description: 'Campo por el cual ordenar los productos (por defecto: createdAt)',
    required: false,
  })
  @ApiQuery({
    name: 'direction',
    description: 'Dirección de ordenamiento (ASC o DESC, por defecto: DESC)',
    required: false,
  })
  @ApiResponse({ status: 200, description: 'Lista de productos obtenida exitosamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  @Get()
  async findAll(@Res() res: Response, @Query('category') categoryName: string, @Query('page') page = 1, @Query('limit') limit = 20, @Query('orderBy') orderBy = 'createdAt', @Query('direction') direction = 'DESC') {
    const products = await this.productsService.findAll(categoryName, page, limit, orderBy, direction);
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
    type: CreateProductDto,
    isArray: true
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

  @ApiBearerAuth()
  @ApiBody({
    description: 'Actualiza producto',
    type: UpdateProductDto
  })
  @ApiResponse({ status: 201, description: 'Producto actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Mal enviado los datos de actualización' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  @UseGuards(JwtAuthGuard)
  @Patch()
  async update(@Body() productsData: UpdateProductDto, @Res() res: Response) {
    const products = await this.productsService.update(productsData);
    return res.status(201).json(products);
  }

  @ApiBearerAuth()
  @ApiBody({
    description: 'Actualiza varios productos al mismo tiempo',
    type: UpdateProductDto,
    isArray: true
  })
  @ApiResponse({ status: 201, description: 'Producto actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Mal enviado los datos de actualización' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  @UseGuards(JwtAuthGuard)
  @Patch('bulk')
  async bulkUpdate(@Body() productsData: UpdateProductDto[], @Res() res: Response) {
    const products = await this.productsService.bulkUpdate(productsData);
    return res.status(201).json(products);
  }
}