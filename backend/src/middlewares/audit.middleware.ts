import { Request } from 'express';
import { auditLogRepository } from '@repositories/auditLog.repository';
import { AuditAction } from '@constants/enums';

/**
 * Not an Express middleware in the traditional sense — a helper invoked from
 * within services/controllers after a mutating action, so it can capture the
 * actual old/new values rather than guessing from req.body.
 */
export async function recordAudit(params: {
  req: Request;
  action: AuditAction;
  entityType: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
}) {
  const { req, action, entityType, entityId, oldValue, newValue } = params;
  if (!req.user) return;

  await auditLogRepository.create({
    organizationId: req.user.organizationId as any,
    actorId: req.user.userId as any,
    actorName: (req as any).userName ?? 'Unknown',
    action,
    entityType,
    entityId: entityId as any,
    oldValue,
    newValue,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
}
