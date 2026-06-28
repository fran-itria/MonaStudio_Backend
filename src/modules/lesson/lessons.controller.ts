import { Controller, Get, Res } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import type { Response } from 'express';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) { }

  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Se obtiene lista de modulos",
    example: [
      {
        id: "uuid-módulo-1",
        title: "Módulo 1",
        content: {
          title: "Introducción al desarrollo web",
          description: "Javascript, HTML y Css"
        }
      }
    ]
  })
  @Get()
  async findAllLessons(@Res() res: Response) {
    const lessons = await this.lessonsService.findAll()
    return res.status(200).json(lessons)
  }

  @Get()
  async findOne(@Res() res: Response) {
    const lessons = await this.lessonsService.findAll()
    return res.status(200).json(lessons)
  }
}
