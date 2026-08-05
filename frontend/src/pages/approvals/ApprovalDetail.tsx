import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FullPageSpinner, Spinner } from '@/components/ui/Spinner';
import { useApprovalWorkflow, useActOnApproval } from '@/hooks/useApprovals';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { CheckCircle2, Circle, XCircle, Building2 } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Role } from '@/constants/roles';
import { Vendor } from '@/types';
import { GeneratePOSection } from './GeneratePOSection';

const STAGE_ROLE: Record<string, Role> = {
  manager: Role.PROCUREMENT_MANAGER,
  finance: Role.FINANCE,
  director: Role.DIRECTOR,
};

export default function ApprovalDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useApprovalWorkflow(id);
  const act = useActOnApproval();
  const role = useAppSelector((s) => s.auth.user?.role);
  const [comment, setComment] = useState('');

  if (isLoading || !data) return <FullPageSpinner />;
  const { purchaseRequest, workflow } = data;
  const vendorName = typeof purchaseRequest.vendorId === 'object' ? (purchaseRequest.vendorId as Vendor).companyName : purchaseRequest.vendorId;
  const canAct = role && STAGE_ROLE[purchaseRequest.currentStage as string] === role && purchaseRequest.status === 'pending_approval';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">{purchaseRequest.title}</h2>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted"><Building2 size={14} /> {vendorName} · {formatCurrency(purchaseRequest.amount)}</p>
        </div>
        <Badge status={purchaseRequest.status} />
      </div>

      <Card title="Approval timeline">
        <div className="space-y-4">
          {workflow.steps.map((step, i) => (
            <div key={step.stage} className="flex gap-3">
              <div className="flex flex-col items-center">
                {step.status === 'approved' && <CheckCircle2 className="text-success" size={20} />}
                {step.status === 'rejected' && <XCircle className="text-danger" size={20} />}
                {step.status === 'pending' && <Circle className="text-muted" size={20} />}
                {i < workflow.steps.length - 1 && <div className="mt-1 h-8 w-px bg-border" />}
              </div>
              <div className="flex-1 pb-2">
                <p className="text-sm font-medium capitalize text-ink">{step.stage}</p>
                <p className="text-xs text-muted">
                  {step.status === 'pending' ? 'Awaiting decision' : `${step.status} ${step.actedAt ? '· ' + formatDateTime(step.actedAt) : ''}`}
                </p>
                {step.comment && <p className="mt-1 rounded-md bg-surface p-2 text-xs text-ink">{step.comment}</p>}
              </div>
            </div>
          ))}
        </div>

        {canAct && (
          <div className="mt-4 border-t border-border pt-4">
            <label className="label">Comment (optional)</label>
            <textarea className="input" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => act.mutate({ id: purchaseRequest._id, decision: 'approve', comment })}
                disabled={act.isPending}
                className="btn-primary"
              >
                {act.isPending && <Spinner className="h-4 w-4 text-white" />} Approve
              </button>
              <button
                onClick={() => act.mutate({ id: purchaseRequest._id, decision: 'reject', comment })}
                disabled={act.isPending}
                className="btn-danger"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </Card>

      {purchaseRequest.status === 'approved' && (role === Role.ADMIN || role === Role.PROCUREMENT_MANAGER || role === Role.FINANCE) && (
        <GeneratePOSection purchaseRequestId={purchaseRequest._id} />
      )}
    </div>
  );
}
