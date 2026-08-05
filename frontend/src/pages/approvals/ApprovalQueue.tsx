import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { useApprovalQueue } from '@/hooks/useApprovals';
import { PurchaseRequest, Vendor } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

export default function ApprovalQueue() {
  const { data, isLoading } = useApprovalQueue();
  const navigate = useNavigate();

  const columns: Column<PurchaseRequest>[] = [
    { header: 'Title', render: (r) => <span className="font-medium text-ink">{r.title}</span> },
    { header: 'Vendor', render: (r) => (typeof r.vendorId === 'object' ? (r.vendorId as Vendor).companyName : r.vendorId) },
    { header: 'Amount', render: (r) => formatCurrency(r.amount) },
    { header: 'Department', render: (r) => r.department || '—' },
    { header: 'Requested', render: (r) => formatDate(r.createdAt) },
    { header: 'Stage', render: (r) => <Badge status={r.currentStage} /> },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Purchase requests awaiting your approval, in order received.</p>
      <Card>
        <DataTable
          columns={columns}
          rows={data ?? []}
          isLoading={isLoading}
          emptyTitle="Nothing pending your approval"
          onRowClick={(r) => navigate(`/approvals/${r._id}`)}
        />
      </Card>
    </div>
  );
}
