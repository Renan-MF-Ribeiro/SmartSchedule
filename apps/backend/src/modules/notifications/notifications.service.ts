import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FirebaseService } from '../../infra/firebase/firebase.service';
import { ISchedule, INotification, NotificationType } from '@smartschedule/shared';
import { UsersService } from '../users/users.service';
import { SchedulesService } from '../schedules/schedules.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly firebase: FirebaseService,
    private readonly usersService: UsersService,
    private readonly schedulesService: SchedulesService,
  ) {}

  /** Runs every day at 08:00 to send morning reminders */
  @Cron('0 8 * * *')
  async sendMorningReminders(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    this.logger.log(`Sending morning reminders for ${today}`);
    const schedules = await this.schedulesService.findByDateRange(today, today);
    for (const schedule of schedules) {
      await this.sendReminderToParticipants(schedule, NotificationType.SCHEDULE_REMINDER_MORNING);
    }
  }

  /** Runs every 15 minutes to check for 1.5h pre-schedule reminders */
  @Cron('*/15 * * * *')
  async sendPreScheduleReminders(): Promise<void> {
    const now = new Date();
    const target = new Date(now.getTime() + 90 * 60 * 1000);
    const targetDate = target.toISOString().split('T')[0];
    const targetTime = `${String(target.getHours()).padStart(2, '0')}:${String(target.getMinutes()).padStart(2, '0')}`;

    const schedules = await this.schedulesService.findByDateRange(targetDate, targetDate);
    const upcoming = schedules.filter(s => s.startTime === targetTime);

    for (const schedule of upcoming) {
      await this.sendReminderToParticipants(schedule, NotificationType.SCHEDULE_REMINDER_PRE);
    }
  }

  async sendCommentNotification(
    scheduleId: string,
    adminId: string,
    commenterName: string,
  ): Promise<void> {
    const admin = await this.usersService.findById(adminId);
    if (!admin.fcmTokens.length) return;

    const message = {
      notification: {
        title: 'Novo comentário na escala',
        body: `${commenterName} comentou na escala`,
      },
      tokens: admin.fcmTokens,
    };

    try {
      await this.firebase.messaging.sendEachForMulticast(message);
      await this.saveNotification({
        type: NotificationType.COMMENT_ADDED,
        scheduleId,
        userId: adminId,
        title: message.notification.title,
        body: message.notification.body,
        sent: true,
        sentAt: new Date().toISOString(),
        scheduledFor: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Failed to send comment notification: ${error}`);
    }
  }

  private async sendReminderToParticipants(
    schedule: ISchedule,
    type: NotificationType,
  ): Promise<void> {
    const userIds = schedule.positions
      .filter(p => p.userId)
      .map(p => p.userId as string);

    const title = type === NotificationType.SCHEDULE_REMINDER_MORNING
      ? `Você tem escala hoje`
      : `Sua escala começa em 1h30`;

    const body = `${schedule.title} - ${schedule.startTime}`;

    for (const userId of userIds) {
      const isDuplicate = await this.checkDuplicateNotification(schedule.id, userId, type);
      if (isDuplicate) continue;

      try {
        const user = await this.usersService.findById(userId);
        if (!user.fcmTokens.length) continue;

        await this.firebase.messaging.sendEachForMulticast({
          notification: { title, body },
          tokens: user.fcmTokens,
        });

        await this.saveNotification({
          type,
          scheduleId: schedule.id,
          userId,
          title,
          body,
          sent: true,
          sentAt: new Date().toISOString(),
          scheduledFor: new Date().toISOString(),
        });
      } catch (error) {
        this.logger.error(`Failed to send notification to user ${userId}: ${error}`);
      }
    }
  }

  private async checkDuplicateNotification(
    scheduleId: string,
    userId: string,
    type: NotificationType,
  ): Promise<boolean> {
    const snapshot = await this.firebase.firestore
      .collection('notifications')
      .where('scheduleId', '==', scheduleId)
      .where('userId', '==', userId)
      .where('type', '==', type)
      .where('sent', '==', true)
      .limit(1)
      .get();
    return !snapshot.empty;
  }

  private async saveNotification(
    data: Omit<INotification, 'id'>,
  ): Promise<void> {
    await this.firebase.firestore.collection('notifications').add(data);
  }
}
