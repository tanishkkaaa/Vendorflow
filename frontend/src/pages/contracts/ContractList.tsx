import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { useContracts } from '@/hooks/useContracts';
import { Contract, Vendor } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { Plus } from 'lucide-react';
import { UploadContractModal } from './UploadContractModal';
import { useAppSelector } from '@/app/hooks';
import { Role } from '@/constants/roles';

export default function ContractList() {
  const [status, setStatus] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const { data, isLoading } = useContracts({ status: status || undefined });
  const navigate = useNavigate();
  const role = useAppSelector((s) => s.auth.user?.role);
  const canManage = role === Role.ADMIN || role === Role.PROCUREMENT_MANAGER;

  const columns: Column<Contract>[] = [
    { header: 'Title', render: (c) => <span className="font-medium text-ink">{c.title}</span> },
    { header: 'Vendor', render: (c) => (typeof c.vendorId === 'object' ? (c.vendorId as Vendor).companyName : c.vendorId) },
    { header: 'Value', render: (c) => (c.contractValue ? formatCurrency(c.contractValue) : '—') },
    { header: 'Ends', render: (c) => formatDate(c.endDate) },
    { header: 'Version', render: (c) => `v${c.currentVersion}` },
    { header: 'Status', render: (c) => <Badge status={c.status} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="expiring_soon">Expiring Soon</option>
          <option value="expired">Expired</option>
          <option value="renewed">Renewed</option>
          <option value="terminated">Terminated</option>
        </select>
        {canManage && (
          <button onClick={() => setUploadOpen(true)} className="btn-primary"><Plus size={16} /> Upload contract</button>
        )}
      </div>
      <Card>
        <DataTable columns={columns} rows={data?.items ?? []} isLoading={isLoading} emptyTitle="No contracts yet" onRowClick={(c) => navigate(`/contracts/${c._id}`)} />
      </Card>
      <UploadContractModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}
