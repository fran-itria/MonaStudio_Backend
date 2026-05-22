import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";


export class UserDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    nombre!: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    apellido!: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    mail!: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    contrasena!: string
}