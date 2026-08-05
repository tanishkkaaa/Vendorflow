import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { DataTable, Column } from '@/components/ui/DataTable';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { PurchaseOrder, Vendor } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { CheckCircle2, Clock } from 'lucide-react';

export default function PurchaseOrderList() {
  const { data, isLoading } = usePurchaseOrders();
  const navigate = useNavigate();

  const columns: Column<PurchaseOrder>[] = [
    { header: 'PO Number', render: (p) => <span className="font-mono text-xs">{p.poNumber}</span> },
    { header: 'Vendor', render: (p) => (typeof p.vendorId === 'object' ? (p.vendorId as Vendor).companyName : p.vendorId) },
    { header: 'Items', render: (p) => p.items.length },
    { header: 'Total', render: (p) => formatCurrency(p.grandTotal) },
    { header: 'Delivery', render: (p) => formatDate(p.deliveryDate) },
    {
      header: 'Emailed',
      render: (p) =>
        p.emailedToVendor ? (
          <span className="flex items-center gap-1 text-xs text-success"><CheckCircle2 size={14} /> Sent</span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-muted"><Clock size={14} /> Pending</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <DataTable columns={columns} rows={data ?? []} isLoading={isLoading} emptyTitle="No purchase orders yet" onRowClick={(p) => navigate(`/purchase-orders/${p._id}`)} />
      </Card>
    </div>
  );
}
