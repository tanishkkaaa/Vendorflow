import { rfqRepository } from '@repositories/rfq.repository';
import { vendorRepository } from '@repositories/vendor.repository';
import { ApiError } from '@utils/ApiError';
import { RFQStatus, NotificationType } from '@constants/enums';
import { enqueueNotification } from '@jobs/queues/notification.queue';
import { enqueueEmail } from '@jobs/queues/email.queue';
import { userRepository } from '@repositories/user.repository';
import { getPagination, buildMeta } from '@utils/pagination.util';
import { Request } from 'express';
import { v4 as uuid } from 'uuid';

export const rfqService = {
  async create(organizationId: string, createdBy: string, input: {
    title: string;
    department?: string;
    items: { name: string; quantity: number; specifications?: string }[];
    budget?: number;
    deliveryDate?: Date;
    specifications?: string;
    submissionDeadline?: Date;
  }) {
    const rfqCode = `RFQ-${new Date().getFullYear()}-${uuid().split('-')[0].toUpperCase()}`;
    return rfqRepository.create({
      organizationId,
      rfqCode,
      createdBy,
      status: RFQStatus.DRAFT,
      ...input,
    } as any);
  },

  async getById(id: string, organizationId: string) {
    const rfq = await rfqRepository.findById(id, ['invitedVendors', 'createdBy']);
    if (!rfq || String(rfq.organizationId) !== organizationId) throw ApiError.notFound('RFQ not found');
    return rfq;
  },

  async list(req: Request, organizationId: string, filters: Record<string, unknown> = {}) {
    const { skip, limit, sort, page } = getPagination(req);
    const query = { organizationId, ...filters };
    const [items, total] = await Promise.all([
      rfqRepository.find(query, { skip, limit, sort }),
      rfqRepository.count(query),
    ]);
    return { items, meta: buildMeta(total, page, limit) };
  },

  /** Publishes the RFQ and invites the given vendors, notifying them by email + in-app. */
  async publishAndInvite(id: string, organizationId: string, vendorIds: string[]) {
    const rfq = await rfqService.getById(id, organizationId);
    const vendors = await vendorRepository.find({ _id: { $in: vendorIds }, organizationId });
    if (vendors.length === 0) throw ApiError.badRequest('No valid vendors selected for invitation');

    rfq.invitedVendors = vendors.map((v) => v._id) as any;
    rfq.status = RFQStatus.PUBLISHED;
    await rfq.save();

    const vendorUsers = await userRepository.find({ vendorId: { $in: vendorIds } });

    await enqueueNotification({
      organizationId,
      recipientIds: vendorUsers.map((u) => String(u._id)),
      type: NotificationType.RFQ_RECEIVED,
      title: 'New RFQ Invitation',
      message: `You have been invited to submit a quotation for "${rfq.title}"`,
      link: `/vendor/rfqs/${rfq._id}`,
    });

    for (const vendor of vendors) {
      await enqueueEmail({
        to: vendor.email,
        subject: `New RFQ Invitation: ${rfq.title}`,
        html: `<p>Hello ${vendor.contactPerson},</p><p>You've been invited to submit a quotation for <b>${rfq.title}</b>${
          rfq.submissionDeadline ? ` by ${new Date(rfq.submissionDeadline).toDateString()}` : ''
        }.</p><p>Please log in to VendorFlow AI to view details and submit your quote.</p>`,
      });
    }

    return rfq;
  },

  async close(id: string, organizationId: string) {
    const rfq = await rfqService.getById(id, organizationId);
    rfq.status = RFQStatus.CLOSED;
    await rfq.save();
    return rfq;
  },
};
