import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './infra/firebase/firebase.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { TeamsModule } from './modules/teams/teams.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ScheduleFormatsModule } from './modules/schedule-formats/schedule-formats.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FirebaseModule,
    AuthModule,
    UsersModule,
    SchedulesModule,
    TeamsModule,
    AvailabilityModule,
    NotificationsModule,
    ScheduleFormatsModule,
  ],
})
export class AppModule {}
