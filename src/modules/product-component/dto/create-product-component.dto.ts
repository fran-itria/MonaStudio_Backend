import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";
import { SelectionMode } from "../entities/product-component.entity";


export class CreateProductComponentDto {
    @ApiProperty({ type: 'string', description: 'Id del combo/oferta', example: 'id-del-combo/oferta' })
    @IsNotEmpty()
    productId!: string

    @ApiProperty({ type: 'string', description: 'Id de la variedad del producto a reducir stock', example: 'id-del-productVarity' })
    @IsOptional()
    varityId!: string

    @ApiProperty({ type: 'string', description: 'Id del producto que forma parte del combo/oferta al que reducir stock', example: 'id-del-producto' })
    @IsOptional()
    componentId!: string

    @ApiProperty({ type: 'number', description: 'Cantidad de stock a reducir del producto', example: 2 })
    @IsOptional()
    stockReduce!: number

    @ApiProperty({ type: 'string', description: 'Modo de selección del componente (fixed, custom)', example: 'fixed' })
    @IsOptional()
    selectionMode!: SelectionMode

    @ApiProperty({ type: 'number', description: 'Cantidad de variedades a elegir (solo si selectionMode es "custom")', example: 2 })
    @IsOptional()
    selectionQuantity!: number
}