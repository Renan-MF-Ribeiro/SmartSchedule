import { NotificationType } from '../enums/notification-type.enum';

export interface INotification {
  id: string;
  type: NotificationType;
  scheduleId: string;
  userId: string;
  title: string;
  body: string;
  sentAt?: Date | string;
  scheduledFor: Date | string;
  sent: boolean;
}
