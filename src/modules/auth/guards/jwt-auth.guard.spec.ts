import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let authService: jest.Mocked<Pick<AuthService, 'findUserById'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'verifyAsync'>>;

  beforeEach(() => {
    authService = {
      findUserById: jest.fn(),
    };

    jwtService = {
      verifyAsync: jest.fn(),
    };

    guard = new JwtAuthGuard(
      jwtService as JwtService,
      authService as AuthService,
    );
  });

  it('should set request user from a valid bearer token', async () => {
    const request = {
      headers: { authorization: 'Bearer valid-token' },
    } as Request & { user?: { id: string; mail: string } };

    jwtService.verifyAsync.mockResolvedValue({
      sub: 'u-1',
    });

    authService.findUserById.mockResolvedValue({
      id: 'u-1',
      nombre: 'Ana',
      apellido: 'Perez',
      contrasena: 'hashed-password',
      mail: 'ana@mail.com',
    });

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    };

    await expect(
      guard.canActivate(context as unknown as ExecutionContext),
    ).resolves.toBe(true);
    expect(request.user).toEqual({
      id: 'u-1',
      mail: 'ana@mail.com',
    });
  });

  it('should throw UnauthorizedException when token is missing', async () => {
    const request = {
      headers: {},
    } as Request;

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    };

    await expect(
      guard.canActivate(context as unknown as ExecutionContext),
    ).rejects.toThrow(new UnauthorizedException('Token no provisto'));
  });

  it('should throw UnauthorizedException when token is invalid', async () => {
    const request = {
      headers: { authorization: 'Bearer bad-token' },
    } as Request;

    jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    };

    await expect(
      guard.canActivate(context as unknown as ExecutionContext),
    ).rejects.toThrow(new UnauthorizedException('Token inválido'));
  });

  it('should throw UnauthorizedException when user from token does not exist', async () => {
    const request = {
      headers: { authorization: 'Bearer valid-token' },
    } as Request;

    jwtService.verifyAsync.mockResolvedValue({
      sub: 'u-missing',
    });
    authService.findUserById.mockResolvedValue(null);

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    };

    await expect(
      guard.canActivate(context as unknown as ExecutionContext),
    ).rejects.toThrow(new UnauthorizedException('Token inválido'));
  });
});
