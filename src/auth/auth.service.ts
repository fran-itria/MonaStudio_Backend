import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

type AuthenticatedUser = Omit<User, 'contrasena'>;
type JwtUserPayload = Pick<User, 'id' | 'mail'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    mail: string,
    contrasena: string,
  ): Promise<AuthenticatedUser | null> {
    const user = await this.usersService.findByMail(mail);
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
    return this.usersService.findById(id);
  }
}
