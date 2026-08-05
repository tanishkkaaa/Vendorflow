import { Worker, Job } from 'bullmq';
import { redisConnection } from '@config/redis';
import { logger } from '@config/logger';
import { notificationService } from '@services/notification.service';
import { NotificationJobData } from '@jobs/queues/notification.queue';

export const notificationWorker = new Worker<NotificationJobData>(
  'notification-queue',
  async (job: Job<NotificationJobData>) => {
    const { organizationId, recipientIds, type, title, message, link } = job.data;
    await notificationService.notifyMany(recipientIds, { organizationId, type, title, message, link });
  },
  { connection: redisConnection, concurrency: 5 }
);

notificationWorker.on('completed', (job) => logger.info(`[notification.worker] dispatched job ${job.id}`));
notificationWorker.on('failed', (job, err) => logger.error(`[notification.worker] job ${job?.id} failed: ${err.message}`));
