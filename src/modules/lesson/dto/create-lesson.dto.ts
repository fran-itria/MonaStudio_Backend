import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";


export class CreateLessonDto {
    @ApiProperty({
        description: 'Nombre o título del módulo',
        example: 'Módulo 1: Introducción a la programación',
    })
    @IsNotEmpty({ message: 'El título del módulo es obligatorio' })
    title!: string;

    @ApiProperty({
        description: 'Contenido del módulo',
        isArray: true,
        items: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Título de la lección' },
                description: { type: 'string', description: 'Descripción de la lección' },
            },
        },
        example: [
            { title: 'Lección 1', description: 'Introducción a la programación' },
            { title: 'Lección 2', description: 'Variables y tipos de datos' },
        ],
    })
    @IsNotEmpty({ message: 'El contenido del módulo es obligatorio' })
    content!: { title: string, description?: string }[];
}