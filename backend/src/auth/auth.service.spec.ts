import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

jest.mock('bcrypt', () => ({
  compare: jest.fn<Promise<boolean>, [string, string]>(),
}));

const mockUsersService = {
  findByEmail: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };

    const mockUser = new User();
    mockUser.id = 'user-uuid';
    mockUser.email = 'test@example.com';
    mockUser.password = 'hashedPassword';

    it('should throw UnauthorizedException if user is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      const compareMock = bcrypt.compare as unknown as jest.Mock<
        Promise<boolean>,
        [string, string]
      >;
      compareMock.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
    });

    it('should return an access_token on successful login', async () => {
      const fakeToken = 'fake-jwt-token';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      const compareMock = bcrypt.compare as unknown as jest.Mock<
        Promise<boolean>,
        [string, string]
      >;
      compareMock.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue(fakeToken);

      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result.access_token).toEqual(fakeToken);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });
  });
});
