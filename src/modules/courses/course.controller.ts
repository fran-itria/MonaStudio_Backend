import { Controller } from '@nestjs/common';
import { CoursesService } from './course.service';

@Controller('course')
export class CoursesController {
  constructor(private readonly courseService: CoursesService) { }
}
