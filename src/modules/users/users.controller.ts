import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { UserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService
  ) { }
  @ApiBearerAuth()
  @ApiBody({
    description: 'Create a new user',
    schema: {
      type: 'object',
      properties: {
        nombre: { type: 'string' },
        apellido: { type: 'string' },
        mail: { type: 'string' },
        contrasena: { type: 'string' },
      },
      required: ['nombre', 'apellido', 'mail', 'contrasena'],
    },
  })
  @ApiResponse({ status: 201, description: 'Usuario creado con éxito.', type: UserDto })
  @Post()
  async create(@Body() createUserDto: UserDto): Promise<UserDto | void> {
    return await this.usersService.create(createUserDto);
  }
}
