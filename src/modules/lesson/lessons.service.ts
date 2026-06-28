import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { Repository } from 'typeorm';
import { ErrorsExceptions } from '../../Errors/custom-errors-exceptions';
import { LessonsErrors } from '../../Errors/lessons.errors';

@Injectable()
export class LessonsService {
    constructor(
        @InjectRepository(Lesson)
        private readonly lessonsRepository: Repository<Lesson>
    ) { }

    async findAll() {
        const lessons = await this.lessonsRepository.find()
        if (lessons.length == 0) throw ErrorsExceptions.notFound(LessonsErrors.LESSONS_NOT_FOUND.errorCode, LessonsErrors.LESSONS_NOT_FOUND.message)
        return lessons
    }
}
