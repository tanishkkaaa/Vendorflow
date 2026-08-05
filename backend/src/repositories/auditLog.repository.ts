import { BaseRepository } from './base.repository';
import { AuditLog, IAuditLog } from '@models/AuditLog.model';

class AuditLogRepository extends BaseRepository<IAuditLog> {
  constructor() {
    super(AuditLog);
  }
}

export const auditLogRepository = new AuditLogRepository();
