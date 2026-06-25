import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";
import { ModalityEnum } from "../enums/modality.enums";


export class CreateCourseDto {
    @ApiProperty({ description: 'Nombre del curso', example: 'Curso de TypeScript' })
    @IsNotEmpty({ message: 'El nombre del curso es obligatorio' })
    name!: string;

    @ApiProperty({ description: 'Descripción del curso', example: 'Aprende TypeScript desde cero' })
    @IsNotEmpty({ message: 'La descripción del curso es obligatoria' })
    description!: string;

    @ApiProperty({ description: 'Duración del curso', example: '4 meses' })
    @IsNotEmpty({ message: 'La duración del curso es obligatoria' })
    duration!: string;

    @ApiProperty({ enum: ModalityEnum, description: 'Modalidad del curso', example: 'Presencial' })
    @IsNotEmpty({ message: 'La modalidad del curso es obligatoria' })
    modality!: string;

    @ApiProperty({ description: 'Fecha de inicio del curso', example: '2023-01-01' })
    @IsOptional()
    start?: string;

    @ApiProperty({ description: 'Días del curso', example: 'Lunes, Miércoles y Viernes' })
    @IsOptional()
    days?: string;

    @ApiProperty({ description: 'Horario del curso', example: '18:00 a 20:00 / 9 a 13' })
    @IsOptional()
    hours?: string;

    @ApiProperty({ description: 'Ubicación del curso', example: 'Mona Studio' })
    @IsOptional()
    location?: string;

    @ApiProperty({ description: 'Promoción del curso', example: { title: 'Descuento de verano', description: '20% de descuento en el curso', price: 100 } })
    @IsOptional()
    promotion?: { title: string, description: string, price: number };

    @ApiProperty({ description: 'Propuesta del curso', example: 'Aprenderás a programar en TypeScript' })
    @IsOptional()
    proposal?: string;

    @ApiProperty({ description: 'Objetivo del curso', example: 'Aprender a programar en TypeScript' })
    @IsOptional()
    objective?: string;

    @ApiProperty({
        description: 'Lo que incluye el curso',
        isArray: true,
        type: 'array',
        items: { type: 'string' },
        example: ['Material de estudio', 'Certificado de finalización']
    })
    @IsOptional()
    include?: string[];

    @ApiProperty({
        description: 'Requisitos del curso',
        isArray: true,
        type: 'array',
        items: {
            type: 'object',
            properties: {
                description: { type: 'string', description: 'Breve explicación del requisito', example: 'Conocimientos básicos de programación' },
                listElementes: { type: 'array', description: 'Lista de elementos del requisito', items: { type: 'string' }, example: ['Acceso a internet', 'Computadora'] }
            },
            required: ['listElementes']
        },
        example: ['Conocimientos básicos de programación', 'Acceso a internet']
    })
    @IsOptional()
    requirements?: string[];

    @ApiProperty({
        description: 'Condiciones del curso',
        isArray: true,
        type: 'array',
        items: { type: 'string' },
        example: ['Asistencia mínima del 80%', 'Entrega de trabajos']
    })
    @IsNotEmpty({ message: 'Las condiciones del curso son obligatorias' })
    conditionsOfCourse!: string[];

    @ApiProperty({ description: 'Información importante del curso', example: 'Es obligatorio asistir a todas las clases' })
    @IsNotEmpty({ message: 'La información importante del curso es obligatoria' })
    importantInformation!: string;

    @ApiProperty({ description: 'Precio del curso', example: 200 })
    @IsOptional()
    priceCourse?: number;

    @ApiProperty({
        description: 'Precio por clase del curso',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Título de la clase', example: 'Clase 1' },
                price: { type: 'number', description: 'Precio de la clase', example: 50 }
            }
        },
        isArray: true,
        example: [{ title: 'Clase 1', price: 50 }, { title: 'Clase 2', price: 75 }]
    })
    @IsOptional()
    priceForClass?: { title: string, price: number }[];

    @ApiProperty({
        description: 'Clases/Dias/Modulos del curso',
        type: 'array',
        items: {
            type: 'string',
        },
        isArray: true,
        example: ['uuid-de-modulo-1', 'uuid-de-modulo-2']
    })
    @IsNotEmpty()
    lessons!: string[];
}