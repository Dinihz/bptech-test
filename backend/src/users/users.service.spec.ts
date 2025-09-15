import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn<Promise<string>, [string, string | number]>(),
  compare: jest.fn<Promise<boolean>, [string, string]>(),
}));

type UserRepositoryMock = jest.Mocked<
  Pick<Repository<User>, 'findOne' | 'create' | 'save'>
>;

const createMockRepository = (): UserRepositoryMock =>
  ({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  }) as unknown as UserRepositoryMock;

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: UserRepositoryMock;

  const hashMock = bcrypt.hash as unknown as jest.Mock<
    Promise<string>,
    [string, string | number]
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepositoryMock>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const email = 'test@example.com';
      const mockUser = new User();
      mockUser.email = email;

      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail(email);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email } });
    });
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should NOT create a user if email already exists', async () => {
      userRepository.findOne.mockResolvedValue(new User());

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
    });

    it('should create a user successfully', async () => {
      const hashedPassword = 'hashedPassword';
      const newUser = new User();

      userRepository.findOne.mockResolvedValue(null);
      hashMock.mockResolvedValue(hashedPassword);
      userRepository.create.mockReturnValue(newUser);
      userRepository.save.mockResolvedValue({
        id: 'user-uuid',
        ...createUserDto,
        password: hashedPassword,
      });

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.id).toEqual('user-uuid');
      expect(hashMock).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(userRepository.save).toHaveBeenCalledWith({
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
      });
    });
  });
});
