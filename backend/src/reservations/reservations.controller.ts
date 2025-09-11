import {
  Controller,
  Post,
  UseGuards,
  Body,
  Request,
  Get,
  Query,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('reservations')
@UseGuards(AuthGuard('jwt'))
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  findAll(
    @Query('date') date?: string,
    @Query('roomId') roomId?: string,
    @Query('userId') userId?: string,
  ) {
    const filters = { date, roomId, userId };
    return this.reservationsService.findAll(filters);
  }

  @Post()
  create(
    @Body() createReservationDto: CreateReservationDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.reservationsService.create(createReservationDto, req.user);
  }

  @Get('mine')
  findMyReservations(@Request() req: AuthenticatedRequest) {
    return this.reservationsService.findMyReservations(req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.reservationsService.remove(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.reservationsService.update(id, updateReservationDto, req.user.userId);
  }
}
