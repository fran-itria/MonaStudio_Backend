import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

type AuthenticatedUser = Omit<User, 'contrasena'>;
type JwtUserPayload = Pick<User, 'id' | 'mail'>;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(
    mail: string,
    contrasena: string,
  ): Promise<AuthenticatedUser | null> {
    const user = await this.userRepository.findOne({ where: { mail } });
    if (!user) {
      return null;
    }

    const isValidPassword = await compare(contrasena, user.contrasena);

    if (!isValidPassword) {
      return null;
    }

    return {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      mail: user.mail,
    };
  }

  login(user: JwtUserPayload) {
    return {
      access_token: this.jwtService.sign({
        sub: user.id,
        mail: user.mail,
      }),
    };
  }

  findUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}
