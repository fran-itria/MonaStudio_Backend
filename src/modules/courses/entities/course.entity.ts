import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Lesson } from "../../lesson/entities/lesson.entity";
import { ModalityEnum } from "../enums/modality.enums";

@Entity('courses')
export class Course {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @CreateDateColumn({
        type: 'timestamp',
    })
    createdAt!: Date;

    @UpdateDateColumn({
        type: 'timestamp',
    })
    updatedAt!: Date;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @Column({ type: 'varchar', length: 100 })
    name!: string;

    @Column({ type: 'jsonb' })
    description!: string[];

    @Column({ type: 'varchar', length: 255 })
    duration!: string;

    @Column({ enum: ModalityEnum, type: 'varchar', length: 255 })
    modality!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    start?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    days?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    hours?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    location?: string;

    @Column({ type: 'jsonb', nullable: true })
    promotion?: { title: string, description: string, price: number };

    @Column({ type: 'varchar', length: 255, nullable: true })
    proposal?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    objective?: string;

    @Column({ type: 'jsonb', nullable: true })
    include?: string[]

    @Column({ type: 'jsonb', nullable: true })
    requirements?: string[]

    @Column({ type: 'jsonb' })
    conditionsOfCourse!: string[]

    @Column({ type: 'varchar', length: 255 })
    importantInformation!: string;

    @Column({ type: 'bigint', nullable: true })
    priceCourse?: number;

    @Column({ type: 'jsonb', nullable: true })
    priceForClass?: { title: string, price: number }[];

    @ManyToMany(() => Lesson, (lesson) => lesson.courses, {
        cascade: false,
    })
    @JoinTable({
        name: 'course_lessons',
        joinColumn: { name: 'courseId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'lessonId', referencedColumnName: 'id' },
    })
    lessons!: Lesson[];
}