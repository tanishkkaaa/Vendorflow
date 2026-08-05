import { Worker, Job } from 'bullmq';
import { redisConnection } from '@config/redis';
import { logger } from '@config/logger';
import { emailService } from '@services/email.service';
import { EmailJobData } from '@jobs/queues/email.queue';

export const emailWorker = new Worker<EmailJobData>(
  'email-queue',
  async (job: Job<EmailJobData>) => {
    const { to, subject, html, attachments } = job.data;
    await emailService.send({
      to,
      subject,
      html,
      attachments: attachments?.map((a) => ({ filename: a.filename, content: Buffer.from(a.content, 'base64') })),
    });
  },
  { connection: redisConnection, concurrency: 5 }
);

emailWorker.on('completed', (job) => logger.info(`[email.worker] sent job ${job.id} to ${job.data.to}`));
emailWorker.on('failed', (job, err) => logger.error(`[email.worker] job ${job?.id} failed: ${err.message}`));
