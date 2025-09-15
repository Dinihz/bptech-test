import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReservationsService } from './reservations.service';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Repository } from 'typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';

const mockRepository: jest.Mocked<
  Pick<Repository<Reservation>, 'findOne' | 'create' | 'save'>
> = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
} as unknown as jest.Mocked<
  Pick<Repository<Reservation>, 'findOne' | 'create' | 'save'>
>;

describe('ReservationsService', () => {
  let service: ReservationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    type ReqUser = { userId: string; email: string };
    const user: ReqUser = { userId: 'user-uuid-123', email: 'test@test.com' };
    const createDto: CreateReservationDto = {
      roomId: 'sala-01',
      date: new Date(),
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
    };

    it('should NOT create a reservation in the past', async () => {
      const pastDto = { ...createDto, startTime: new Date(Date.now() - 1000) };

      await expect(service.create(pastDto, user)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should NOT create a reservation with less than 1 hour duration', async () => {
      const shortDto = {
        ...createDto,
        endTime: new Date(createDto.startTime.getTime() + 30 * 60 * 1000),
      };

      await expect(service.create(shortDto, user)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should NOT create an overlapping reservation', async () => {
      mockRepository.findOne.mockResolvedValue(new Reservation());

      await expect(service.create(createDto, user)).rejects.toThrow(
        ConflictException,
      );

      expect(mockRepository.findOne).toHaveBeenCalled();
    });

    it('should create a reservation successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null as unknown as Reservation);
      const createdReservation: Reservation = {
        id: 'temp-id',
        roomId: createDto.roomId,
        date: createDto.date,
        startTime: createDto.startTime,
        endTime: createDto.endTime,
        user: {
          id: user.userId,
          name: 'Tester',
          email: 'test@test.com',
          password: 'hash',
        },
      };
      mockRepository.create.mockReturnValue(createdReservation);
      const savedReservation: Reservation = {
        ...createdReservation,
        id: 'uuid-test',
      };
      mockRepository.save.mockResolvedValue(savedReservation);

      const result = await service.create(createDto, user);

      expect(result).toBeDefined();
      expect(result.id).toEqual('uuid-test');
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        user: { id: user.userId },
      });
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
