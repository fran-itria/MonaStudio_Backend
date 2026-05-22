import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';

type JwtPayload = {
  sub: string;
  mail?: string;
  iat?: number;
  exp?: number;
};

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    mail: string;
  };
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token no provisto');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Token inválido');
    }

    const user = await this.authService.findUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Token inválido');
    }

    request.user = {
      id: user.id,
      mail: user.mail,
    };

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;

    if (typeof authHeader !== 'string') {
      return undefined;
    }

    const [type, token] = authHeader.trim().split(/\s+/, 2);
    if (!type || !token) {
      return undefined;
    }

    return type === 'Bearer' ? token : undefined;
  }
}
