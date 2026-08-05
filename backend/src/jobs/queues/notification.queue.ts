import { Queue } from 'bullmq';
import { redisConnection } from '@config/redis';
import { NotificationType } from '@constants/enums';

export interface NotificationJobData {
  organizationId: string;
  recipientIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export const notificationQueue = new Queue<NotificationJobData>('notification-queue', { connection: redisConnection });

export async function enqueueNotification(data: NotificationJobData) {
  await notificationQueue.add('dispatch-notification', data, {
    attempts: 3,
    removeOnComplete: 200,
    removeOnFail: 500,
  });
}
