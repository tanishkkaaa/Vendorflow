import { quotationRepository } from '@repositories/quotation.repository';
import { rfqRepository } from '@repositories/rfq.repository';
import { ApiError } from '@utils/ApiError';
import { RFQStatus, NotificationType } from '@constants/enums';
import { uploadService } from './upload.service';
import { aiService } from './ai.service';
import { enqueueQuotationExtraction } from '@jobs/queues/aiExtraction.queue';
import { enqueueNotification } from '@jobs/queues/notification.queue';
import { userRepository } from '@repositories/user.repository';
import { Role } from '@constants/roles';

export const quotationService = {
  /**
   * Vendor submits a quotation PDF. Stored immediately; AI extraction is
   * queued asynchronously (BullMQ) so the upload request returns fast and
   * the PDF-to-structured-data work happens in the background worker.
   */
  async submit(
    organizationId: string,
    vendorId: string,
    input: {
      rfqId: string;
      price: number;
      deliveryTimelineDays: number;
      warrantyMonths?: number;
      file: { buffer: Buffer };
    }
  ) {
    const rfq = await rfqRepository.findById(input.rfqId);
    if (!rfq || String(rfq.organizationId) !== organizationId) throw ApiError.notFound('RFQ not found');
    if (rfq.status !== RFQStatus.PUBLISHED) throw ApiError.badRequest('This RFQ is not open for quotations');

    const isInvited = rfq.invitedVendors.some((v) => String(v) === vendorId);
    if (!isInvited) throw ApiError.forbidden('You were not invited to this RFQ');

    const uploaded = await uploadService.uploadBuffer(input.file.buffer, `quotations/${input.rfqId}`, 'raw');

    const quotation = await quotationRepository.create({
      organizationId,
      rfqId: input.rfqId,
      vendorId,
      price: input.price,
      deliveryTimelineDays: input.deliveryTimelineDays,
      warrantyMonths: input.warrantyMonths,
      quotationPdfUrl: uploaded.url,
      quotationPdfPublicId: uploaded.publicId,
    } as any);

    await enqueueQuotationExtraction({ quotationId: String(quotation._id) });

    const internalUsers = await userRepository.find({
      organizationId,
      role: { $in: [Role.PROCUREMENT_MANAGER, Role.ADMIN] },
    });
    await enqueueNotification({
      organizationId,
      recipientIds: internalUsers.map((u) => String(u._id)),
      type: NotificationType.QUOTATION_SUBMITTED,
      title: 'New Quotation Received',
      message: `A new quotation was submitted for RFQ "${rfq.title}"`,
      link: `/rfqs/${rfq._id}/quotations`,
    });

    return quotation;
  },

  async listForRFQ(rfqId: string) {
    return quotationRepository.findByRFQ(rfqId);
  },

  async getById(id: string) {
    const quotation = await quotationRepository.findById(id, 'vendorId rfqId');
    if (!quotation) throw ApiError.notFound('Quotation not found');
    return quotation;
  },

  /**
   * AI-powered comparison across all quotations submitted for an RFQ.
   * Relies on the `extracted` fields populated asynchronously by the AI
   * extraction worker — quotations still pending extraction are excluded
   * with a warning so the comparison isn't skewed by incomplete data.
   */
  async compareForRFQ(rfqId: string, organizationId: string) {
    const rfq = await rfqRepository.findById(rfqId);
    if (!rfq || String(rfq.organizationId) !== organizationId) throw ApiError.notFound('RFQ not found');

    const quotations = await quotationRepository.findByRFQ(rfqId);
    const ready = quotations.filter((q) => q.extracted?.extractedAt);
    const pending = quotations.length - ready.length;

    if (ready.length < 2) {
      throw ApiError.badRequest(
        `Need at least 2 AI-processed quotations to compare. ${pending} quotation(s) still processing.`
      );
    }

    const comparison = await aiService.compareQuotations({
      rfqTitle: rfq.title,
      budget: rfq.budget,
      quotations: ready.map((q) => ({
        quotationId: String(q._id),
        vendorName: (q.vendorId as any)?.companyName ?? 'Unknown Vendor',
        price: q.extracted.price ?? q.price,
        warrantyMonths: q.extracted.warrantyMonths ?? q.warrantyMonths,
        deliveryDays: q.extracted.deliveryDays ?? q.deliveryTimelineDays,
        paymentTerms: q.extracted.paymentTerms,
        penaltyClause: q.extracted.penaltyClause,
      })),
    });

    // Persist rank + notes back onto each quotation for quick display later
    await Promise.all(
      comparison.ranking.map((r) =>
        quotationRepository.updateById(r.quotationId, {
          aiRank: r.rank,
          aiRecommendationNotes: r.pros.join('; '),
        })
      )
    );

    return { ...comparison, pendingCount: pending };
  },
};
