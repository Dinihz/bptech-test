import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  FindManyOptions,
  FindOptionsWhere,
} from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { User } from 'src/users/entities/user.entity';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,
  ) {}

  async create(
    createReservationDto: CreateReservationDto,
    reqUser: { userId: string; email: string },
  ) {
    const { startTime, endTime, roomId } = createReservationDto;
    const now = new Date();

    if (new Date(startTime) < now) {
      throw new BadRequestException(
        'It is now possible to schedule a reservation in the past.',
      );
    }

    const duration =
      new Date(endTime).getTime() - new Date(startTime).getTime();
    const oneHourInMilliSeconds = 60 * 60 * 1000;
    if (duration < oneHourInMilliSeconds) {
      throw new BadRequestException('The minimum reservation time is 1 hour.');
    }
    const existingReservation = await this.reservationsRepository.findOne({
      where: {
        roomId,
        startTime: LessThanOrEqual(endTime),
        endTime: MoreThanOrEqual(startTime),
      },
    });

    if (existingReservation) {
      throw new ConflictException(
        'There is already a reservation for this room at this time.',
      );
    }

    const reservation = this.reservationsRepository.create({
      ...createReservationDto,
      user: { id: reqUser.userId } as User,
    });

    return this.reservationsRepository.save(reservation);
  }

  async findAll(filters: {
    date?: string;
    roomId?: string;
    userId?: string;
    userName?: string;
  }): Promise<Reservation[]> {
    const where: FindOptionsWhere<Reservation> = {};

    if (filters.roomId) {
      where.roomId = filters.roomId as unknown as Reservation['roomId'];
    }
    if (filters.userId) {
      where.user = { id: filters.userId } as Reservation['user'];
    }
    if (filters.date) {
      (where as Pick<Reservation, 'date'>).date =
        filters.date as unknown as Reservation['date'];
    }

    const options: FindManyOptions<Reservation> = {
      where,
      relations: ['user'],
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        roomId: true,
        user: {
          id: true,
          name: true,
          email: true,
        },
      },
    };

    if (filters.userName) {
      (options.where as FindOptionsWhere<Reservation>) = {
        ...options.where,
        user: {
          ...(filters.userId ? { id: filters.userId } : {}),
          name:
            typeof filters.userName === 'string'
              ? (filters.userName as unknown as Reservation['user']['name'])
              : undefined,
        },
      } as FindOptionsWhere<Reservation>;

      const qb = this.reservationsRepository
        .createQueryBuilder('reservation')
        .leftJoinAndSelect('reservation.user', 'user')
        .select([
          'reservation.id',
          'reservation.date',
          'reservation.startTime',
          'reservation.endTime',
          'reservation.roomId',
          'user.id',
          'user.name',
          'user.email',
        ]);

      if (filters.roomId) {
        qb.andWhere('reservation.roomId = :roomId', { roomId: filters.roomId });
      }
      if (filters.userId) {
        qb.andWhere('user.id = :userId', { userId: filters.userId });
      }
      qb.andWhere('user.name ILIKE :userName', {
        userName: `%${filters.userName}%`,
      });
      if (filters.date) {
        qb.andWhere('reservation.date = :date', { date: filters.date });
      }

      return qb.getMany();
    }

    return this.reservationsRepository.find(options);
  }

  async findMyReservations(userId: string): Promise<Reservation[]> {
    return this.reservationsRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        roomId: true,
        user: {
          id: true,
          name: true,
          email: true,
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const reservation = await this.reservationsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation ID "${id}" not found.`);
    }

    if (reservation.user.id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this reservation.',
      );
    }

    await this.reservationsRepository.delete(id);

    return { message: 'Reservation cancelled successfully.' };
  }

  async update(
    id: string,
    updateReservationDto: UpdateReservationDto,
    userId: string,
  ) {
    const reservation = await this.reservationsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation ID "${id}" not found.`);
    }

    if (reservation.user.id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to edit this reservation.',
      );
    }

    const updatedReservation = Object.assign(reservation, updateReservationDto);
    await this.reservationsRepository.save(updatedReservation);

    const safe = await this.reservationsRepository.findOne({
      where: { id },
      relations: ['user'],
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        roomId: true,
        user: {
          id: true,
          name: true,
          email: true,
        },
      },
    });

    return safe!;
  }
}
