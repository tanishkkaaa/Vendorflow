import cron from 'node-cron';
import { contractRepository } from '@repositories/contract.repository';
import { userRepository } from '@repositories/user.repository';
import { ContractStatus, NotificationType } from '@constants/enums';
import { enqueueNotification } from '@jobs/queues/notification.queue';
import { enqueueEmail } from '@jobs/queues/email.queue';
import { logger } from '@config/logger';
import { Role } from '@constants/roles';

/**
 * Runs daily at 08:00 server time.
 * - Flags contracts within `reminderDaysBefore` of expiry as EXPIRING_SOON
 * - Flags contracts past endDate as EXPIRED
 * - Sends in-app + email reminders to Procurement Managers and Admins
 */
export function registerContractExpiryCron() {
  cron.schedule('0 8 * * *', async () => {
    logger.info('[cron] Running contract expiry check');
    try {
      const upcoming = await contractRepository.findExpiringWithinDays(30);
      const now = new Date();

      for (const contract of upcoming) {
        const daysLeft = Math.ceil((contract.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const shouldRemind = daysLeft <= contract.reminderDaysBefore;
        const alreadyRemindedToday =
          contract.lastReminderSentAt &&
          new Date(contract.lastReminderSentAt).toDateString() === now.toDateString();

        if (!shouldRemind || alreadyRemindedToday) continue;

        const newStatus = daysLeft <= 0 ? ContractStatus.EXPIRED : ContractStatus.EXPIRING_SOON;
        contract.status = newStatus;
        contract.lastReminderSentAt = now;
        await contract.save();

        const recipients = await userRepository.find({
          organizationId: contract.organizationId,
          role: { $in: [Role.ADMIN, Role.PROCUREMENT_MANAGER] },
        });

        const vendorName = (contract.vendorId as any)?.companyName ?? 'Vendor';
        const message =
          daysLeft <= 0
            ? `Contract "${contract.title}" with ${vendorName} has expired.`
            : `Contract "${contract.title}" with ${vendorName} expires in ${daysLeft} day(s).`;

        await enqueueNotification({
          organizationId: String(contract.organizationId),
          recipientIds: recipients.map((r) => String(r._id)),
          type: NotificationType.CONTRACT_EXPIRING,
          title: 'Contract Expiry Alert',
          message,
          link: `/contracts/${contract._id}`,
        });

        for (const recipient of recipients) {
          await enqueueEmail({
            to: recipient.email,
            subject: `[VendorFlow AI] Contract Expiry Alert: ${contract.title}`,
            html: `<p>${message}</p><p>Please review and initiate renewal if required.</p>`,
          });
        }
      }
      logger.info(`[cron] Contract expiry check complete. ${upcoming.length} contract(s) evaluated.`);
    } catch (err) {
      logger.error(`[cron] Contract expiry check failed: ${(err as Error).message}`);
    }
  });
}
