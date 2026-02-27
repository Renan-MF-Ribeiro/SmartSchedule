import { DayOfWeek } from '../enums/day-of-week.enum';

export interface ITimeSlot {
  start: string; // HH:mm
  end: string; // HH:mm
}

export interface ISpecificUnavailability {
  date: string; // YYYY-MM-DD
  reason?: string;
}

export interface IAvailability {
  id: string;
  userId: string;
  availableDays: DayOfWeek[];
  availableTimeSlots: ITimeSlot[];
  specificUnavailabilities: ISpecificUnavailability[];
  updatedAt: Date | string;
}
