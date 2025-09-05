import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ReservationsModule } from './reservations/reservations.module';

@Module({
  imports: [AuthModule, UsersModule, ReservationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
