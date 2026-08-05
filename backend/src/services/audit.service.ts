import { auditLogRepository } from '@repositories/auditLog.repository';
import { AuditAction } from '@constants/enums';
import { getPagination, buildMeta } from '@utils/pagination.util';
import { Request } from 'express';

export const auditService = {
  async log(params: {
    organizationId: string;
    actorId: string;
    actorName: string;
    action: AuditAction;
    entityType: string;
    entityId: string;
    oldValue?: unknown;
    newValue?: unknown;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return auditLogRepository.create(params as any);
  },

  async list(req: Request, organizationId: string, filters: Record<string, unknown> = {}) {
    const { skip, limit, sort, page } = getPagination(req);
    const query = { organizationId, ...filters };
    const [items, total] = await Promise.all([
      auditLogRepository.find(query, { skip, limit, sort, populate: 'actorId' }),
      auditLogRepository.count(query),
    ]);
    return { items, meta: buildMeta(total, page, limit) };
  },
};
