import { Worker, Job } from 'bullmq';
import { redisConnection } from '@config/redis';
import { logger } from '@config/logger';
import { aiService } from '@services/ai.service';
import { quotationRepository } from '@repositories/quotation.repository';
import { contractRepository } from '@repositories/contract.repository';
import { QuotationExtractionJobData, ContractSummaryJobData } from '@jobs/queues/aiExtraction.queue';
import { emitToOrganization } from '@sockets/socket.handler';

async function fetchPdfAsBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download PDF from ${url}: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export const aiExtractionWorker = new Worker(
  'ai-extraction-queue',
  async (job: Job) => {
    if (job.name === 'extract-quotation') {
      const { quotationId } = job.data as QuotationExtractionJobData;
      const quotation = await quotationRepository.findById(quotationId);
      if (!quotation) return;

      const pdfBuffer = await fetchPdfAsBuffer(quotation.quotationPdfUrl);
      const extracted = await aiService.extractQuotationFromPdf(pdfBuffer);

      await quotationRepository.updateById(quotationId, {
        extracted: {
          price: extracted.price ?? undefined,
          currency: extracted.currency ?? undefined,
          warrantyMonths: extracted.warrantyMonths ?? undefined,
          deliveryDays: extracted.deliveryDays ?? undefined,
          paymentTerms: extracted.paymentTerms ?? undefined,
          penaltyClause: extracted.penaltyClause ?? undefined,
          otherTerms: extracted.otherTerms ?? undefined,
          rawSummary: extracted.summary,
          extractionConfidence: extracted.confidence,
          extractedAt: new Date(),
        },
      });

      emitToOrganization(String(quotation.organizationId), 'quotation:ai-extracted', {
        quotationId,
        rfqId: String(quotation.rfqId),
      });
    }

    if (job.name === 'summarize-contract') {
      const { contractId, versionNumber } = job.data as ContractSummaryJobData;
      const contract = await contractRepository.findById(contractId);
      if (!contract) return;

      const version = contract.versions.find((v) => v.version === versionNumber);
      if (!version) return;

      const pdfBuffer = await fetchPdfAsBuffer(version.fileUrl);
      const result = await aiService.summarizeContract(pdfBuffer);

      version.aiSummary = result.summary;
      version.aiRiskFlags = result.riskFlags;
      await contract.save();

      emitToOrganization(String(contract.organizationId), 'contract:ai-summarized', { contractId });
    }
  },
  { connection: redisConnection, concurrency: 3 }
);

aiExtractionWorker.on('completed', (job) => logger.info(`[ai.worker] completed ${job.name} (${job.id})`));
aiExtractionWorker.on('failed', (job, err) => logger.error(`[ai.worker] ${job?.name} (${job?.id}) failed: ${err.message}`));
