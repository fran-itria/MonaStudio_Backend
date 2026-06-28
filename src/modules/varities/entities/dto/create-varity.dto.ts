import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";


export class CreateVarityDto {
    @ApiProperty({ type: "string" })
    @IsNotEmpty()
    name!: string
}