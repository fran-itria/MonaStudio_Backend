import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBadGatewayResponse, ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCategoryDto } from './dto/create-categorie-dto';
import { CategoriesService } from './categories.service';
import type { Response } from 'express';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService
  ) { }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Lista de categorías obtenida con éxito.', example: [{ id: 'uuid', name: 'Categoría 1', active: true }] })
  @Get()
  async findAll(@Res() res: Response) {
    const categories = await this.categoriesService.findAll();
    res.status(200).json(categories);
  }

  @ApiBearerAuth()
  @ApiBody({
    description: 'Crear nueva categoría',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      required: ['name'],
    }
  })
  @ApiResponse({ status: 201, description: 'Categoría creada con éxito.', example: { name: 'Categoría 1' } })
  @ApiResponse({ status: 400, description: 'Error al crear la categoría.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: CreateCategoryDto, @Res() res: Response) {
    const newCategory = await this.categoriesService.create(body)
    if (newCategory) {
      res.status(201).json(newCategory);
    }
  }

  @ApiBearerAuth()
  @ApiBody({
    description: 'Crear múltiples categorías',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: ['name'],
      },
    }
  })
  @ApiResponse({ status: 201, description: 'Categorías creadas con éxito.', type: [CreateCategoryDto] })
  @ApiResponse({ status: 400, description: 'Error al crear las categorías.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  @ApiBadGatewayResponse({ description: 'Error al crear las categorías.' })
  @ApiBadRequestResponse({ description: 'Error al crear las categorías.' })
  @UseGuards(JwtAuthGuard)
  @Post('bulk')
  async bulkCreate(@Body() body: CreateCategoryDto[], @Res() res: Response) {
    const newCategories = await this.categoriesService.bulkCreate(body)
    if (newCategories) {
      res.status(201).json(newCategories);
    }
  }
}
