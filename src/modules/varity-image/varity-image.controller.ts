import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { CreateImagesDto } from './dto/create-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductVarityImageService } from './varity-image.service';

@Controller('varity-image')
export class ProductVarityImageController {
  constructor(private readonly productVarityImageService: ProductVarityImageService) { }

  @ApiBearerAuth()
  @ApiResponse({ status: 201 })
  @ApiBody({
    type: CreateImagesDto,
    isArray: true
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  async bulkCreate(@Res() res: Response, @Body() body: { images: CreateImagesDto[] }) {
    await this.productVarityImageService.bulkCreate(body.images)
    res.status(201).json("Imagenes registradas con éxito")
  }
}
