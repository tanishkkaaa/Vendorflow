import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { useVendors } from '@/hooks/useVendors';
import { Vendor } from '@/types';
import { Search } from 'lucide-react';

export default function VendorList() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading } = useVendors({ status: status || undefined, search: search || undefined });
  const navigate = useNavigate();

  const columns: Column<Vendor>[] = [
    { header: 'Company', render: (v) => <span className="font-medium text-ink">{v.companyName}</span> },
    { header: 'Contact', render: (v) => v.contactPerson },
    { header: 'Email', render: (v) => v.email },
    { header: 'GST', render: (v) => <span className="font-mono text-xs">{v.gstNumber || '—'}</span> },
    { header: 'Score', render: (v) => `${v.score}/100` },
    { header: 'Status', render: (v) => <Badge status={v.status} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            className="input pl-9"
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <Card>
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          isLoading={isLoading}
          emptyTitle="No vendors found"
          onRowClick={(v) => navigate(`/vendors/${v._id}`)}
        />
      </Card>
    </div>
  );
}
