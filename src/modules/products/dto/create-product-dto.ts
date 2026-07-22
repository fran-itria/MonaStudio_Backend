import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { CreateProductComponentDto } from "../../product-component/dto/create-product-component.dto";

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
    description!: string

    @ApiPropertyOptional({ description: 'Variedades del producto', example: [{ name: 'Rojo', stock: 5, image: 'https://example.com/image1.jpg' }, { name: 'Azul', stock: 3, image: 'https://example.com/image2.jpg' }] })
    @IsOptional()
    @IsArray()
    varities?: { name: string, stock: number, image?: string }[]

    @ApiPropertyOptional({ description: 'Productos relacionados', example: [{ id: 'id-producto-relacionado-1' }, { id: 'id-producto-relacionado-2' }] })
    @IsOptional()
    @IsArray()
    relatedProducts?: { id: string }[]

    @ApiPropertyOptional({ description: 'Productos complementarios', example: [{ id: 'id-producto-complementario-1' }, { id: 'id-producto-complementario-2' }] })
    @IsOptional()
    @IsArray()
    complementProducts?: { id: string }[]

    @ApiPropertyOptional({ description: 'Secciones del producto', example: ['Destacados', 'Nuevos'] })
    @IsOptional()
    @IsArray()
    section?: string[]

    @ApiProperty({ description: 'Categorías del producto', example: ['id-categoria-1', 'id-categoria-2'] })
    @IsNotEmpty()
    @IsArray()
    categories!: string[]

    @ApiProperty({
        type: CreateProductComponentDto,
        description: 'Productos a los que ser educirá el estock en una oferta o combo',
        example: [
            {
                varityId: 'id-productVarity',
                componentId: 'id-producto-relacionado-1',
                stockReduce: 2,
                selectionMode: "custom",
                selectionQuantity: 2
            }
        ]
    })
    @IsOptional()
    @IsArray()
    productsComponent?: CreateProductComponentDto[]
}