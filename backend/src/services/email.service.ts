import nodemailer, { Transporter } from 'nodemailer';
import { env } from '@config/env';
import { logger } from '@config/logger';

let transporter: Transporter;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return transporter;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
}

export const emailService = {
  async send(params: SendEmailParams): Promise<void> {
    try {
      await getTransporter().sendMail({
        from: env.smtp.from,
        to: params.to,
        subject: params.subject,
        html: params.html,
        attachments: params.attachments,
      });
    } catch (err) {
      logger.error(`Failed to send email to ${params.to}: ${(err as Error).message}`);
      throw err;
    }
  },
};
