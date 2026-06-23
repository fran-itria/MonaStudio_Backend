import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'user@example.com'
  })
  @IsNotEmpty()
  @IsEmail()
  mail!: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123'
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  contrasena!: string;
}
