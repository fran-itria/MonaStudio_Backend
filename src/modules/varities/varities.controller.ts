import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { VaritiesService } from './varities.service';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateVarityDto } from './entities/dto/create-varity.dto';
import type { Response } from 'express';

@Controller('varities')
export class VaritiesController {
  constructor(private readonly varitiesService: VaritiesService) { }

  @ApiBearerAuth()
  @ApiBody({ type: CreateVarityDto })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() name: CreateVarityDto, @Res() res: Response) {
    const varity = await this.varitiesService.create(name)
    return res.status(201).json({ message: "Variedad creada con éxito", varity })
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateVarityDto, isArray: true })
  @UseGuards(JwtAuthGuard)
  @Post('bulkCreate')
  async bulkCreate(@Body() varities: CreateVarityDto[], @Res() res: Response) {
    const varity = await this.varitiesService.bulkCreate(varities)
    return res.status(201).json({ message: "Variedades creadas con éxito" })
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async get(@Res() res: Response) {
    const varities = await this.varitiesService.getAll()
    return res.status(200).json(varities)
  }
}
