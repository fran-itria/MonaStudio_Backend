import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) { }

  findByMail(mail: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { mail } });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(userData: Partial<User>): Promise<UserDto | void> {
    try {
      const user = this.usersRepository.create(userData);
      const savedUser = await this.usersRepository.save(user);
      return {
        nombre: savedUser.nombre,
        apellido: savedUser.apellido,
        mail: savedUser.mail,
        contrasena: savedUser.contrasena,
      }
    }
    catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('duplicate key value') && error.driverError.detail.includes('mail')) {
          throw new BadRequestException('El correo electrónico ya está registrado.');
        }
      }
    }
  }
}
