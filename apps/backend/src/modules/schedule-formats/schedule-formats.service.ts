import { Injectable } from '@nestjs/common';
import { ScheduleFormatsRepository } from './schedule-formats.repository';
import { CreateScheduleFormatDto } from './dto/create-schedule-format.dto';
import { IScheduleFormat, DayOfWeek } from '@smartschedule/shared';

@Injectable()
export class ScheduleFormatsService {
  constructor(private readonly repo: ScheduleFormatsRepository) {}

  async upsert(createdBy: string, dto: CreateScheduleFormatDto): Promise<IScheduleFormat> {
    return this.repo.upsert(createdBy, dto);
  }

  async findAll(): Promise<IScheduleFormat[]> {
    return this.repo.findAll();
  }

  async findByDayOfWeek(dayOfWeek: DayOfWeek): Promise<IScheduleFormat | null> {
    return this.repo.findByDayOfWeek(dayOfWeek);
  }
}
