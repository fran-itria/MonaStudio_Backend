import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";



export class CreateImagesDto {
    @ApiProperty({ type: 'string', required: true })
    @IsNotEmpty()
    productVarityId!: string

    @ApiProperty({ type: 'string' })
    @IsNotEmpty()
    url!: string
}