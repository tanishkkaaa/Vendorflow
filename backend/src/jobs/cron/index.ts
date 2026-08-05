import { registerContractExpiryCron } from './contractExpiry.cron';
import { logger } from '@config/logger';

export function registerAllCronJobs() {
  registerContractExpiryCron();
  logger.info('[cron] All cron jobs registered');
}
