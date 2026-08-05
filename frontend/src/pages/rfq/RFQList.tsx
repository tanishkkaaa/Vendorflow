import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { useRFQs, useInvitedRFQs } from '@/hooks/useRFQs';
import { RFQ } from '@/types';
import { Plus } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Role } from '@/constants/roles';
import { formatCurrency, formatDate } from '@/utils/format';

export default function RFQList() {
  const navigate = useNavigate();
  const role = useAppSelector((s) => s.auth.user?.role);
  const isVendor = role === Role.VENDOR;
  const orgQuery = useRFQs();
  const vendorQuery = useInvitedRFQs();
  const { data, isLoading } = isVendor ? vendorQuery : orgQuery;
  const canCreate = role === Role.ADMIN || role === Role.PROCUREMENT_MANAGER;

  const columns: Column<RFQ>[] = [
    { header: 'RFQ Code', render: (r) => <span className="font-mono text-xs">{r.rfqCode}</span> },
    { header: 'Title', render: (r) => <span className="font-medium text-ink">{r.title}</span> },
    { header: 'Items', render: (r) => r.items.length },
    { header: 'Budget', render: (r) => (r.budget ? formatCurrency(r.budget) : '—') },
    { header: 'Deadline', render: (r) => formatDate(r.submissionDeadline) },
    { header: 'Status', render: (r) => <Badge status={r.status} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{isVendor ? 'RFQs you have been invited to' : 'Requests for quotation created by your team'}</p>
        {canCreate && (
          <button onClick={() => navigate('/rfqs/new')} className="btn-primary">
            <Plus size={16} /> New RFQ
          </button>
        )}
      </div>
      <Card>
        <DataTable columns={columns} rows={data?.items ?? []} isLoading={isLoading} emptyTitle="No RFQs yet" onRowClick={(r) => navigate(`/rfqs/${r._id}`)} />
      </Card>
    </div>
  );
}
