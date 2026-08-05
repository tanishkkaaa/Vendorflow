import { purchaseOrderRepository } from '@repositories/purchaseOrder.repository';
import { purchaseRequestRepository } from '@repositories/purchaseRequest.repository';
import { vendorRepository } from '@repositories/vendor.repository';
import { ApiError } from '@utils/ApiError';
import { PurchaseRequestStatus, NotificationType } from '@constants/enums';
import { generatePurchaseOrderPdf } from '@utils/pdfGenerator.util';
import { aiService } from './ai.service';
import { uploadService } from './upload.service';
import { enqueueEmail } from '@jobs/queues/email.queue';
import { enqueueNotification } from '@jobs/queues/notification.queue';
import { userRepository } from '@repositories/user.repository';
import { v4 as uuid } from 'uuid';

export const purchaseOrderService = {
  /**
   * Generates the Purchase Order once a Purchase Request has cleared the
   * full Manager -> Finance -> Director approval chain:
   * builds the PDF (PDFKit), uploads it, emails the vendor, and notifies
   * the requester + finance team.
   */
  async generateFromApprovedRequest(
    purchaseRequestId: string,
    organizationId: string,
    createdBy: string,
    items: { name: string; quantity: number; unitPrice: number }[],
    options?: { taxRate?: number; deliveryDate?: Date; paymentTerms?: string }
  ) {
    const purchaseRequest = await purchaseRequestRepository.findById(purchaseRequestId);
    if (!purchaseRequest || String(purchaseRequest.organizationId) !== organizationId) {
      throw ApiError.notFound('Purchase request not found');
    }
    if (purchaseRequest.status !== PurchaseRequestStatus.APPROVED) {
      throw ApiError.badRequest('Purchase request has not completed approval');
    }

    const vendor = await vendorRepository.findById(String(purchaseRequest.vendorId));
    if (!vendor) throw ApiError.notFound('Vendor not found');

    const computedItems = items.map((i) => ({ ...i, total: i.quantity * i.unitPrice }));
    const subtotal = computedItems.reduce((sum, i) => sum + i.total, 0);
    const taxRate = options?.taxRate ?? 0.18;
    const tax = Number((subtotal * taxRate).toFixed(2));
    const grandTotal = Number((subtotal + tax).toFixed(2));
    const poNumber = `PO-${new Date().getFullYear()}-${uuid().split('-')[0].toUpperCase()}`;

    const aiSummary = await aiService.generatePurchaseOrderSummary({
      vendorName: vendor.companyName,
      items: computedItems.map((i) => ({ name: i.name, quantity: i.quantity })),
      grandTotal,
      deliveryDate: options?.deliveryDate?.toDateString(),
    });

    const pdfBuffer = await generatePurchaseOrderPdf({
      poNumber,
      issueDate: new Date(),
      organizationName: 'VendorFlow AI Organization',
      vendorName: vendor.companyName,
      vendorEmail: vendor.email,
      vendorAddress: vendor.address,
      items: computedItems,
      subtotal,
      tax,
      grandTotal,
      deliveryDate: options?.deliveryDate,
      paymentTerms: options?.paymentTerms,
      aiSummary,
    });

    const uploaded = await uploadService.uploadBuffer(pdfBuffer, `purchase-orders/${purchaseRequestId}`, 'raw');

    const po = await purchaseOrderRepository.create({
      organizationId,
      purchaseRequestId,
      vendorId: vendor._id,
      poNumber,
      items: computedItems,
      subtotal,
      tax,
      grandTotal,
      deliveryDate: options?.deliveryDate,
      paymentTerms: options?.paymentTerms,
      aiSummary,
      pdfUrl: uploaded.url,
      pdfPublicId: uploaded.publicId,
      createdBy,
    } as any);

    purchaseRequest.status = PurchaseRequestStatus.PO_GENERATED;
    await purchaseRequest.save();

    await enqueueEmail({
      to: vendor.email,
      subject: `Purchase Order ${poNumber} from VendorFlow AI`,
      html: `<p>Dear ${vendor.contactPerson},</p><p>Please find attached Purchase Order <b>${poNumber}</b>.</p><p>${aiSummary}</p>`,
      attachments: [{ filename: `${poNumber}.pdf`, content: pdfBuffer.toString('base64') }],
    });
    po.emailedToVendor = true;
    po.emailedAt = new Date();
    await po.save();

    const financeUsers = await userRepository.find({ organizationId, role: 'finance' });
    await enqueueNotification({
      organizationId,
      recipientIds: [String(purchaseRequest.requestedBy), ...financeUsers.map((u) => String(u._id))],
      type: NotificationType.PURCHASE_ORDER_GENERATED,
      title: 'Purchase Order Generated',
      message: `PO ${poNumber} generated for ${vendor.companyName} and emailed to vendor.`,
      link: `/purchase-orders/${po._id}`,
    });

    return po;
  },

  async getById(id: string, organizationId: string) {
    const po = await purchaseOrderRepository.findById(id, 'vendorId createdBy');
    if (!po || String(po.organizationId) !== organizationId) throw ApiError.notFound('Purchase order not found');
    return po;
  },

  async list(organizationId: string, filters: Record<string, unknown> = {}) {
    return purchaseOrderRepository.find({ organizationId, ...filters }, { populate: 'vendorId' });
  },
};
