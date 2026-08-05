import { Queue } from 'bullmq';
import { redisConnection } from '@config/redis';

export interface QuotationExtractionJobData {
  quotationId: string;
}

export interface ContractSummaryJobData {
  contractId: string;
  versionNumber: number;
}

export const aiExtractionQueue = new Queue('ai-extraction-queue', { connection: redisConnection });

export async function enqueueQuotationExtraction(data: QuotationExtractionJobData) {
  await aiExtractionQueue.add('extract-quotation', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 8000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  });
}

export async function enqueueContractSummary(data: ContractSummaryJobData) {
  await aiExtractionQueue.add('summarize-contract', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 8000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  });
}
