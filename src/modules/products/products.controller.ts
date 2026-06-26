import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product-dto';
import { UpdateProductDto } from './dto/update-product-dto';
import type { Response } from 'express';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilterEnum } from './enums/filterEnum';
import * as typeorm from 'typeorm';
import { Product } from './entities/product.entity';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService
  ) { }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'active',
    description: 'Estado del producto para filtrar (inCatalog o outCatalog)',
    required: false,
    default: 'inCatalog',
    enum: FilterEnum.ACTIVE
  })
  @ApiQuery({
    name: 'category',
    description: 'Nombre de la categoría para filtrar los productos',
    required: false
  })
  @ApiQuery({
    name: 'page',
    description: 'Número de página para la paginación',
    required: false,
    default: 1
  })
  @ApiQuery({
    name: 'limit',
    description: 'Cantidad de productos por página para la paginación (por defecto: 20)',
    required: false,
    default: 20
  })
  @ApiQuery({
    name: 'orderBy',
    description: 'Campo por el cual ordenar los productos',
    required: false,
    enum: FilterEnum.ORDER_BY,
    default: 'createdAt'
  })
  @ApiQuery({
    name: 'direction',
    description: 'Dirección de ordenamiento',
    required: false,
    enum: FilterEnum.DIRECTION,
    enumName: 'DESC'
  })
  @ApiResponse({ status: 200, description: 'Lista de productos obtenida exitosamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  @Get()
  async findAll(
    @Res() res: Response,
    @Query('category') categoryName: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('orderBy') orderBy = 'createdAt',
    @Query('direction') direction = 'DESC',
    @Query('active') active = 'inCatalog'
  ) {
    const products = await this.productsService.findAll(categoryName, page, limit, orderBy, direction, active);
    return res.status(200).json(products);
  }

  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Id del producto a buscar',
    required: true
  })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @Get(':id')
  async findOneProduct(@Param() id: typeorm.FindOptionsWhere<Product>, @Res() res: Response) {
    const product = await this.productsService.findById(id)
    return res.status(200).json(product)
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