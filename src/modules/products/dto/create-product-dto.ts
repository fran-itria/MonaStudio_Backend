import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Category } from "../../categories/entities/category.entity";



export class CreateProductDto {
    @ApiProperty({ description: 'Nombre del producto', example: 'Camiseta' })
    @IsNotEmpty()
    @IsString()
    nombre!: string

    @ApiProperty({ description: 'Precio del producto', example: 7500 })
    @IsNotEmpty()
    @IsNumber()
    price!: number

    @ApiProperty({ description: 'Imagens del producto', example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'] })
    @IsOptional()
    @IsArray()
    image?: string[]

    @ApiProperty({ description: 'Stock del producto', example: 10 })
    @IsNotEmpty()
    @IsNumber()
    stock!: number

    @ApiProperty({ description: 'Precio con descuento del producto', example: 5000 })
    @IsOptional()
    @IsNumber()
    discountedPrice?: number

    @ApiProperty({ description: 'Descripción del producto', example: 'Camiseta de algodón de alta calidad' })
    @IsNotEmpty()
    @IsString()
    description!: string

    @ApiProperty({ description: 'Productos relacionados', example: [{ id: 'uuid-producto-relacionado-1' }, { id: 'uuid-producto-relacionado-2' }] })
    @IsOptional()
    @IsArray()
    relatedProducts?: { id: string }[]

    @ApiProperty({ description: 'Productos complementarios', example: [{ id: 'uuid-producto-complementario-1' }, { id: 'uuid-producto-complementario-2' }] })
    @IsOptional()
    @IsArray()
    complementProducts?: { id: string }[]

    @ApiProperty({ description: 'Secciones del producto', example: ['Destacados', 'Nuevos'] })
    @IsOptional()
    @IsArray()
    section?: string[]

    @ApiProperty({ description: 'Categorías del producto', example: ['uuid-categoria-1', 'uuid-categoria-2'] })
    @IsNotEmpty()
    @IsArray()
    categories!: string[]
}