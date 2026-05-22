import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const usersServiceMock: Pick<
      jest.Mocked<UsersService>,
      'findByMail' | 'findById'
    > = {
      findByMail: jest.fn(),
      findById: jest.fn(),
    };

    const jwtServiceMock: Pick<jest.Mocked<JwtService>, 'sign'> = {
      sign: jest.fn().mockReturnValue('mock-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should validate user credentials and remove password field', async () => {
    usersService.findByMail.mockResolvedValue({
      id: 'u-1',
      nombre: 'Ana',
      apellido: 'Perez',
      contrasena: '123456',
      mail: 'ana@mail.com',
    });

    const validatedUser = await authService.validateUser(
      'ana@mail.com',
      '123456',
    );

    expect(validatedUser).toEqual({
      id: 'u-1',
      nombre: 'Ana',
      apellido: 'Perez',
      mail: 'ana@mail.com',
    });
  });

  it('should create a jwt token with id and mail', () => {
    const result = authService.login({
      id: 'u-1',
      nombre: 'Ana',
      apellido: 'Perez',
      mail: 'ana@mail.com',
    });

    expect(jwtService.sign.mock.calls[0][0]).toEqual({
      sub: 'u-1',
      mail: 'ana@mail.com',
    });
    expect(result).toEqual({
      access_token: 'mock-token',
    });
  });
});
