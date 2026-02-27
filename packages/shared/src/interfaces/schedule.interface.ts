import { ScheduleStatus } from '../enums/schedule-status.enum';

export interface ISchedulePosition {
  id: string;
  label: string;
  order: number;
  userId?: string;
  userPhone?: string; // used when user doesn't exist yet
}

export interface IScheduleComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date | string;
}

export interface ISchedule {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date string YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  teamId?: string;
  positions: ISchedulePosition[];
  comments: IScheduleComment[];
  status: ScheduleStatus;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
