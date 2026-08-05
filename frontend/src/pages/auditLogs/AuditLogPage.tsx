import { Card } from '@/components/ui/Card';
import { DataTable, Column } from '@/components/ui/DataTable';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { AuditLog } from '@/types';
import { formatDateTime } from '@/utils/format';

export default function AuditLogPage() {
  const { data, isLoading } = useAuditLogs();

  const columns: Column<AuditLog>[] = [
    { header: 'Actor', render: (l) => l.actorName },
    { header: 'Action', render: (l) => <span className="uppercase text-xs font-medium">{l.action}</span> },
    { header: 'Entity', render: (l) => l.entityType },
    { header: 'IP Address', render: (l) => <span className="font-mono text-xs">{l.ipAddress || '—'}</span> },
    { header: 'When', render: (l) => formatDateTime(l.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Full audit trail of who edited, approved, or changed what and when.</p>
      <Card>
        <DataTable columns={columns} rows={data?.items ?? []} isLoading={isLoading} emptyTitle="No audit events yet" />
      </Card>
    </div>
  );
}
