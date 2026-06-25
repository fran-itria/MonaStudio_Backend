import { Entity, JoinColumn, ManyToOne, PrimaryColumn, Unique } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { Lesson } from '../../lesson/entities/lesson.entity';

@Entity('course_lessons')
@Unique(['courseId', 'lessonId'])
export class CourseLesson {
    @PrimaryColumn({ type: 'uuid' })
    courseId!: string;

    @PrimaryColumn({ type: 'uuid' })
    lessonId!: string;

    @ManyToOne(() => Course, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'courseId' })
    course!: Course;

    @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'lessonId' })
    lesson!: Lesson;
}
