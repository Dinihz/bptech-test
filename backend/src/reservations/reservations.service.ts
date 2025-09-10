import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { User } from 'src/users/entities/user.entity';

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
}
