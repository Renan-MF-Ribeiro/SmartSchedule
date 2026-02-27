import { Module } from '@nestjs/common';
import { ScheduleFormatsController } from './schedule-formats.controller';
import { ScheduleFormatsService } from './schedule-formats.service';
import { ScheduleFormatsRepository } from './schedule-formats.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ScheduleFormatsController],
  providers: [ScheduleFormatsService, ScheduleFormatsRepository],
  exports: [ScheduleFormatsService],
})
export class ScheduleFormatsModule {}
