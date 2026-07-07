import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ProductImageService } from './product-image.service';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { CreateImagesDto } from './dto/create-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('product-image')
export class ProductImageController {
  constructor(private readonly productImageService: ProductImageService) { }

  @ApiBearerAuth()
  @ApiResponse({ status: 201 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string' },
              url: { type: 'string' },
            },
            required: ['productId', 'url'],
          },
        }
      }
    }
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  async bulkCreate(@Res() res: Response, @Body() body: { images: CreateImagesDto[] }) {
    const images = await this.productImageService.bulkCreate(body.images)
    res.status(201).json("Imagenes registradas con éxito")
  }
}
