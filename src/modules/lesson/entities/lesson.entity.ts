import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Course } from "../../courses/entities/course.entity";


@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  title!: string;

  @Column({ type: 'jsonb' })
  content!: { title: string, description?: string }[];

  @ManyToMany(() => Course, (course) => course.lessons)
  courses!: Course[];
}