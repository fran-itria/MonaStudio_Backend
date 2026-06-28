import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ProductImageService } from './product-image.service';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { CreateImagesDto } from './dto/create-image.dto';

@Controller('product-image')
export class ProductImageController {
  constructor(private readonly productImageService: ProductImageService) { }

  @ApiBearerAuth()
  @ApiResponse({ status: 201 })
  @ApiBody({
    type: CreateImagesDto,
    isArray: true
  })
  @UseGuards()
  @Post()
  async bulkCreate(@Res() res: Response, @Body() body: { images: CreateImagesDto[] }) {
    const images = await this.productImageService.bulkCreate(body.images)
    res.status(201).json("Imagenes registradas con éxito")
  }
}
