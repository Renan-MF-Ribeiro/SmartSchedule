import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';
import { SchedulesModule } from '../schedules/schedules.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ScheduleModule.forRoot(), SchedulesModule, UsersModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
