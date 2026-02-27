import { Injectable } from '@nestjs/common';
import { AvailabilityRepository } from './availability.repository';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { IAvailability, DayOfWeek } from '@smartschedule/shared';

@Injectable()
export class AvailabilityService {
  constructor(private readonly availabilityRepo: AvailabilityRepository) {}

  async getByUserId(userId: string): Promise<IAvailability | null> {
    return this.availabilityRepo.findByUserId(userId);
  }

  async update(userId: string, dto: UpdateAvailabilityDto): Promise<IAvailability> {
    return this.availabilityRepo.upsert(userId, {
      availableDays: dto.availableDays ?? [],
      availableTimeSlots: dto.availableTimeSlots ?? [],
      specificUnavailabilities: dto.specificUnavailabilities ?? [],
      updatedAt: new Date().toISOString(),
    });
  }

  async isUserAvailable(
    userId: string,
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    const availability = await this.availabilityRepo.findByUserId(userId);
    if (!availability) return true; // no restrictions set

    // Check specific unavailabilities
    const isSpecificallyUnavailable = availability.specificUnavailabilities.some(
      u => u.date === date,
    );
    if (isSpecificallyUnavailable) return false;

    // Check available days
    const dateObj = new Date(date + 'T00:00:00');
    const dayOfWeek = dateObj.getDay() as DayOfWeek;
    if (
      availability.availableDays.length > 0 &&
      !availability.availableDays.includes(dayOfWeek)
    ) {
      return false;
    }

    // Check time slots
    if (availability.availableTimeSlots.length > 0) {
      const toMinutes = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };
      const schedStart = toMinutes(startTime);
      const schedEnd = toMinutes(endTime);
      const hasSlot = availability.availableTimeSlots.some(slot => {
        const slotStart = toMinutes(slot.start);
        const slotEnd = toMinutes(slot.end);
        return schedStart >= slotStart && schedEnd <= slotEnd;
      });
      if (!hasSlot) return false;
    }

    return true;
  }
}
