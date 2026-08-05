import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { FullPageSpinner, Spinner } from '@/components/ui/Spinner';
import { AIBadge } from '@/components/ui/AIBadge';
import { usePurchaseOrder } from '@/hooks/usePurchaseOrders';
import { useRateVendor } from '@/hooks/useVendorRatings';
import { formatCurrency, formatDate } from '@/utils/format';
import { Building2, Download, Star } from 'lucide-react';
import { Vendor } from '@/types';
import { useAppSelector } from '@/app/hooks';
import { Role } from '@/constants/roles';

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star size={20} className={n <= value ? 'fill-accent text-accent' : 'text-border'} />
        </button>
      ))}
    </div>
  );
}

export default function PurchaseOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: po, isLoading } = usePurchaseOrder(id);
  const rateVendor = useRateVendor();
  const role = useAppSelector((s) => s.auth.user?.role);
  const canRate = role === Role.ADMIN || role === Role.PROCUREMENT_MANAGER || role === Role.FINANCE;
  const [ratings, setRatings] = useState({ delivery: 5, quality: 5, support: 5, cost: 5 });
  const [comment, setComment] = useState('');

  if (isLoading || !po) return <FullPageSpinner />;
  const vendorName = typeof po.vendorId === 'object' ? (po.vendorId as Vendor).companyName : po.vendorId;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">{po.poNumber}</h2>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted"><Building2 size={14} /> {vendorName}</p>
        </div>
        {po.pdfUrl && (
          <a href={po.pdfUrl} target="_blank" rel="noreferrer" className="btn-secondary">
            <Download size={16} /> Download PDF
          </a>
        )}
      </div>

      {po.aiSummary && (
        <div className="flex items-start gap-2 rounded-md bg-primary-light p-3 text-sm">
          <AIBadge label="AI Summary" />
          <p>{po.aiSummary}</p>
        </div>
      )}

      <Card title="Line items">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase text-muted"><th className="py-2">Item</th><th className="py-2">Qty</th><th className="py-2">Unit Price</th><th className="py-2">Total</th></tr>
          </thead>
          <tbody>
            {po.items.map((item, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="py-2 font-medium">{item.name}</td>
                <td className="py-2">{item.quantity}</td>
                <td className="py-2">{formatCurrency(item.unitPrice)}</td>
                <td className="py-2">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 space-y-1 border-t border-border pt-4 text-right text-sm">
          <p>Subtotal: {formatCurrency(po.subtotal)}</p>
          <p>Tax: {formatCurrency(po.tax)}</p>
          <p className="font-display text-lg font-semibold text-ink">Grand Total: {formatCurrency(po.grandTotal)}</p>
        </div>
      </Card>

      <Card title="Delivery & terms">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-muted">Delivery date</dt><dd>{formatDate(po.deliveryDate)}</dd></div>
          <div><dt className="text-muted">Payment terms</dt><dd>{po.paymentTerms || '—'}</dd></div>
        </dl>
      </Card>

      {canRate && (
        <Card title="Rate this vendor">
          {rateVendor.isSuccess ? (
            <p className="rounded-md bg-success-light p-3 text-sm text-success">Rating submitted — vendor score updated.</p>
          ) : (
            <div className="space-y-4">
              {(['delivery', 'quality', 'support', 'cost'] as const).map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-ink">{key}</span>
                  <StarInput value={ratings[key]} onChange={(v) => setRatings((r) => ({ ...r, [key]: v }))} />
                </div>
              ))}
              <textarea className="input" rows={2} placeholder="Comments (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
              <button
                onClick={() => rateVendor.mutate({ purchaseOrderId: po._id, ...ratings, comment: comment || undefined })}
                disabled={rateVendor.isPending}
                className="btn-primary"
              >
                {rateVendor.isPending && <Spinner className="h-4 w-4 text-white" />} Submit rating
              </button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
