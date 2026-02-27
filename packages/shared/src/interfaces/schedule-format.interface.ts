import { DayOfWeek } from '../enums/day-of-week.enum';

export interface IPositionTemplate {
  id: string;
  label: string;
  order: number;
}

export interface IScheduleFormat {
  id: string;
  dayOfWeek: DayOfWeek;
  positions: IPositionTemplate[];
  createdBy: string;
  updatedAt: Date | string;
}
