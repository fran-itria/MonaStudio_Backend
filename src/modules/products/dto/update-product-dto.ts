import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateProductDto {
    @ApiProperty({ description: 'ID del producto a actualizar', example: 'uuid-producto-1' })
    @IsNotEmpty()
    @IsString()
    id!: string

    @ApiPropertyOptional({ description: 'Nombre del producto', example: 'Camiseta' })
    @IsOptional()
    @IsString()
    nombre?: string

    @ApiPropertyOptional({ description: 'Precio del producto', example: 7500 })
    @IsOptional()
    @IsNumber()
    price?: number

    @ApiPropertyOptional({ description: 'Imagens del producto', example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'] })
    @IsOptional()
    @IsArray()
    image?: string[]

    @ApiPropertyOptional({ description: 'Stock del producto', example: 10 })
    @IsOptional()
    @IsNumber()
    stock?: number

    @ApiPropertyOptional({ description: 'Precio con descuento del producto', example: 5000 })
    @IsOptional()
    @IsNumber()
    discountedPrice?: number

    @ApiPropertyOptional({ description: 'Descripción del producto', example: 'Camiseta de algodón de alta calidad' })
    @IsOptional()
    @IsString()
    description?: string

    @ApiPropertyOptional({ description: 'Variedades del producto', example: [{ id: 'id-variedad-1', stock: 5, active: true }, { id: 'id-variedad-2', stock: 0, active: false }] })
    @IsOptional()
    @IsArray()
    varities?: { id: string, stock: number, active: boolean }[]

    @ApiPropertyOptional({ description: 'Productos relacionados', example: [{ id: 'uuid-producto-relacionado-1' }, { id: 'uuid-producto-relacionado-2' }] })
    @IsOptional()
    @IsArray()
    relatedProducts?: { id: string }[]

    @ApiPropertyOptional({ description: 'Productos complementarios', example: [{ id: 'uuid-producto-complementario-1' }, { id: 'uuid-producto-complementario-2' }] })
    @IsOptional()
    @IsArray()
    complementProducts?: { id: string }[]

    @ApiPropertyOptional({ description: 'Secciones del producto', example: ['Destacados', 'Nuevos'] })
    @IsOptional()
    @IsArray()
    section?: string[]

    @ApiPropertyOptional({ description: 'Categorías del producto', example: ['uuid-categoria-1', 'uuid-categoria-2'] })
    @IsOptional()
    @IsArray()
    categories?: string[]
}