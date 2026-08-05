import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FullPageSpinner, Spinner } from '@/components/ui/Spinner';
import { AIBadge } from '@/components/ui/AIBadge';
import { useRFQ, useCloseRFQ } from '@/hooks/useRFQs';
import { useQuotationsForRFQ, useQuotationComparison } from '@/hooks/useQuotations';
import { useCreatePurchaseRequest } from '@/hooks/useApprovals';
import { PublishRFQModal } from './PublishRFQModal';
import { SubmitQuotationModal } from './SubmitQuotationModal';
import { formatCurrency, formatDate } from '@/utils/format';
import { useAppSelector } from '@/app/hooks';
import { Role } from '@/constants/roles';
import { Send, Sparkles, ShoppingCart } from 'lucide-react';
import { Vendor, Quotation } from '@/types';

export default function RFQDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useAppSelector((s) => s.auth.user?.role);
  const { data: rfq, isLoading } = useRFQ(id);
  const { data: quotations } = useQuotationsForRFQ(id);
  const [publishOpen, setPublishOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const { data: comparison, isFetching: comparing, error: comparisonError } = useQuotationComparison(id, comparisonEnabled);
  const closeRFQ = useCloseRFQ();
  const createPurchaseRequest = useCreatePurchaseRequest();

  const canManage = role === Role.ADMIN || role === Role.PROCUREMENT_MANAGER;
  const isVendor = role === Role.VENDOR;

  if (isLoading || !rfq) return <FullPageSpinner />;

  const handleCreatePurchaseRequest = (q: Quotation) => {
    const vendorName = typeof q.vendorId === 'object' ? (q.vendorId as Vendor).companyName : 'vendor';
    createPurchaseRequest.mutate(
      {
        vendorId: typeof q.vendorId === 'object' ? (q.vendorId as Vendor)._id : q.vendorId,
        title: `${rfq.title} — ${vendorName}`,
        amount: q.extracted.price ?? q.price,
        rfqId: rfq._id,
        quotationId: q._id,
        justification: `Selected via AI-assisted quotation comparison for RFQ ${rfq.rfqCode}`,
      },
      { onSuccess: (result) => navigate(`/approvals/${result.purchaseRequest._id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-semibold">{rfq.title}</h2>
            <Badge status={rfq.status} />
          </div>
          <p className="mt-1 font-mono text-xs text-muted">{rfq.rfqCode}</p>
        </div>
        <div className="flex gap-2">
          {canManage && rfq.status === 'draft' && (
            <button onClick={() => setPublishOpen(true)} className="btn-primary"><Send size={16} /> Publish & invite vendors</button>
          )}
          {canManage && rfq.status === 'published' && (
            <button onClick={() => closeRFQ.mutate(rfq._id)} className="btn-secondary">Close RFQ</button>
          )}
          {isVendor && rfq.status === 'published' && (
            <button onClick={() => setSubmitOpen(true)} className="btn-primary">Submit quotation</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Items requested" className="lg:col-span-2">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted"><th className="py-2">Item</th><th className="py-2">Qty</th><th className="py-2">Specifications</th></tr>
            </thead>
            <tbody>
              {rfq.items.map((item, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-2 font-medium">{item.name}</td>
                  <td className="py-2">{item.quantity}</td>
                  <td className="py-2 text-muted">{item.specifications || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="RFQ details">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Budget</dt><dd>{rfq.budget ? formatCurrency(rfq.budget) : '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Delivery date</dt><dd>{formatDate(rfq.deliveryDate)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Submission deadline</dt><dd>{formatDate(rfq.submissionDeadline)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Invited vendors</dt><dd>{rfq.invitedVendors.length}</dd></div>
          </dl>
        </Card>
      </div>

      {!isVendor && (
        <Card
          title="Quotations & AI comparison"
          action={
            (quotations?.length ?? 0) >= 2 && (
              <button onClick={() => setComparisonEnabled(true)} disabled={comparing} className="btn-secondary text-xs">
                {comparing ? <Spinner className="h-4 w-4" /> : <Sparkles size={14} />} Run AI comparison
              </button>
            )
          }
        >
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted">
                <th className="py-2">Vendor</th><th className="py-2">Price</th><th className="py-2">Warranty</th><th className="py-2">Delivery</th><th className="py-2">AI Rank</th><th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {(quotations ?? []).map((q) => {
                const vendorName = typeof q.vendorId === 'object' ? (q.vendorId as Vendor).companyName : q.vendorId;
                const isRecommended = comparison?.recommendedQuotationId === q._id;
                return (
                  <tr key={q._id} className={`border-b border-border last:border-0 ${isRecommended ? 'bg-success-light/40' : ''}`}>
                    <td className="py-2 font-medium">{vendorName} {isRecommended && <AIBadge label="Recommended" />}</td>
                    <td className="py-2">{formatCurrency(q.extracted.price ?? q.price)}</td>
                    <td className="py-2">{q.extracted.warrantyMonths ?? q.warrantyMonths ?? '—'} mo</td>
                    <td className="py-2">{q.extracted.deliveryDays ?? q.deliveryTimelineDays} days</td>
                    <td className="py-2">{q.extracted.extractedAt ? (q.aiRank ?? '—') : <span className="flex items-center gap-1 text-xs text-muted"><Spinner className="h-3 w-3" /> processing</span>}</td>
                    <td className="py-2">
                      {canManage && (
                        <button onClick={() => handleCreatePurchaseRequest(q)} className="btn-ghost text-xs text-primary">
                          <ShoppingCart size={14} /> Send to approval
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {(quotations ?? []).length === 0 && <p className="py-6 text-center text-sm text-muted">No quotations submitted yet</p>}

          {comparisonError && <p className="mt-3 rounded-md bg-warning-light px-3 py-2 text-sm text-warning">{(comparisonError as any)?.response?.data?.message ?? 'Comparison unavailable yet.'}</p>}

          {comparison && (
            <div className="mt-4 space-y-3 border-t border-border pt-4">
              <div className="flex items-start gap-2 rounded-md bg-primary-light p-3 text-sm text-ink">
                <AIBadge />
                <p>{comparison.recommendationReason}</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {comparison.ranking.sort((a, b) => a.rank - b.rank).map((r) => (
                  <div key={r.quotationId} className="rounded-md border border-border p-3 text-sm">
                    <p className="font-medium">#{r.rank} · {r.vendorName}</p>
                    <ul className="mt-1 list-inside list-disc text-success">{r.pros.map((p, i) => <li key={i}>{p}</li>)}</ul>
                    <ul className="mt-1 list-inside list-disc text-danger">{r.cons.map((c, i) => <li key={i}>{c}</li>)}</ul>
                    {r.estimatedSavingsVsHighest > 0 && <p className="mt-1 text-xs text-muted">Saves {formatCurrency(r.estimatedSavingsVsHighest)} vs. highest quote</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      <PublishRFQModal rfqId={rfq._id} open={publishOpen} onClose={() => setPublishOpen(false)} />
      <SubmitQuotationModal rfqId={rfq._id} open={submitOpen} onClose={() => setSubmitOpen(false)} />
    </div>
  );
}
