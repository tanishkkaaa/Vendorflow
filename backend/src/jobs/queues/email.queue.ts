import { Queue } from 'bullmq';
import { redisConnection } from '@config/redis';

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: string /* base64 */ }[];
}

export const emailQueue = new Queue<EmailJobData>('email-queue', { connection: redisConnection });

export async function enqueueEmail(data: EmailJobData) {
  await emailQueue.add('send-email', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  });
}
