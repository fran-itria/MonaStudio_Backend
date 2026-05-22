import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'mail',
      passwordField: 'contrasena',
    });
  }

  async validate(mail: string, contrasena: string) {
    const user = await this.authService.validateUser(mail, contrasena);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return user;
  }
}
