import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SchedulesRepository } from './schedules.repository';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ISchedule, ScheduleStatus } from '@smartschedule/shared';
import { AvailabilityService } from '../availability/availability.service';
import { UsersService } from '../users/users.service';

const MIN_INTERVAL_MINUTES = 15;

@Injectable()
export class SchedulesService {
  constructor(
    private readonly schedulesRepo: SchedulesRepository,
    private readonly availabilityService: AvailabilityService,
    private readonly usersService: UsersService,
  ) {}

  async create(createdBy: string, dto: CreateScheduleDto): Promise<ISchedule> {
    await this.validateNoTimeConflict(dto.date, dto.startTime, dto.endTime);
    await this.validatePositionsAvailability(dto);

    const now = new Date().toISOString();
    const schedule: Omit<ISchedule, 'id'> = {
      title: dto.title,
      description: dto.description,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      teamId: dto.teamId,
      positions: dto.positions.map(p => ({
        id: p.id,
        label: p.label,
        order: p.order,
        userId: p.userId,
        userPhone: p.userPhone,
      })),
      comments: [],
      status: ScheduleStatus.PENDING,
      createdBy,
      createdAt: now,
      updatedAt: now,
    };

    return this.schedulesRepo.create(schedule);
  }

  async findById(id: string): Promise<ISchedule> {
    const schedule = await this.schedulesRepo.findById(id);
    if (!schedule) throw new NotFoundException(`Schedule ${id} not found`);
    return schedule;
  }

  async findByMonth(year: number, month: number): Promise<ISchedule[]> {
    return this.schedulesRepo.findByMonth(year, month);
  }

  async findByDateRange(startDate: string, endDate: string): Promise<ISchedule[]> {
    return this.schedulesRepo.findByDateRange(startDate, endDate);
  }

  async update(id: string, dto: UpdateScheduleDto): Promise<void> {
    await this.findById(id);
    await this.schedulesRepo.update(id, dto as Partial<ISchedule>);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.schedulesRepo.delete(id);
  }

  async addComment(
    scheduleId: string,
    userId: string,
    userName: string,
    content: string,
  ): Promise<void> {
    const schedule = await this.findById(scheduleId);
    const comment = {
      id: crypto.randomUUID(),
      userId,
      userName,
      content,
      createdAt: new Date().toISOString(),
    };
    const comments = [...schedule.comments, comment];
    await this.schedulesRepo.update(scheduleId, { comments });
  }

  /** Links pending phone-based positions to a user when they register */
  async linkUserByPhone(userId: string, phone: string): Promise<void> {
    const snapshot = await this.schedulesRepo['firebase'].firestore
      .collection('schedules')
      .where('positions', 'array-contains', { userPhone: phone })
      .get();

    for (const doc of snapshot.docs) {
      const schedule = { id: doc.id, ...doc.data() } as ISchedule;
      const updatedPositions = schedule.positions.map(p =>
        p.userPhone === phone ? { ...p, userId, userPhone: undefined } : p,
      );
      await this.schedulesRepo.update(doc.id, { positions: updatedPositions });
    }
  }

  private async validateNoTimeConflict(
    date: string,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.schedulesRepo.findByDate(date);
    const toMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const newStart = toMinutes(startTime);
    const newEnd = toMinutes(endTime);

    for (const s of existing) {
      if (excludeId && s.id === excludeId) continue;
      const existStart = toMinutes(s.startTime);
      const existEnd = toMinutes(s.endTime);

      const overlaps = newStart < existEnd && newEnd > existStart;
      if (overlaps) {
        throw new BadRequestException(
          `Schedules on the same day must have at least ${MIN_INTERVAL_MINUTES} minutes between them`,
        );
      }

      const gapAfterExisting = newStart - existEnd;
      const gapAfterNew = existStart - newEnd;

      if (
        (newStart >= existEnd && gapAfterExisting < MIN_INTERVAL_MINUTES) ||
        (existStart >= newEnd && gapAfterNew < MIN_INTERVAL_MINUTES)
      ) {
        throw new BadRequestException(
          `Schedules on the same day must have at least ${MIN_INTERVAL_MINUTES} minutes between them`,
        );
      }
    }
  }

  private async validatePositionsAvailability(dto: CreateScheduleDto): Promise<void> {
    for (const position of dto.positions) {
      if (!position.userId) continue;
      const isAvailable = await this.availabilityService.isUserAvailable(
        position.userId,
        dto.date,
        dto.startTime,
        dto.endTime,
      );
      if (!isAvailable) {
        throw new BadRequestException(
          `User ${position.userId} is not available at the specified time`,
        );
      }
    }
  }
}
