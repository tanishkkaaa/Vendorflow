import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { AIBadge } from '@/components/ui/AIBadge';
import { useVendor, useUpdateVendorStatus, useCheckDuplicates } from '@/hooks/useVendors';
import { useVendorRatings } from '@/hooks/useVendorRatings';
import { formatDate } from '@/utils/format';
import { ShieldAlert, Star, CheckCircle2, XCircle } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Role } from '@/constants/roles';

export default function VendorDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: vendor, isLoading } = useVendor(id);
  const { data: ratings } = useVendorRatings(id);
  const updateStatus = useUpdateVendorStatus();
  const checkDuplicates = useCheckDuplicates();
  const role = useAppSelector((s) => s.auth.user?.role);
  const [dupResult, setDupResult] = useState<{ isDuplicate: boolean; reason: string } | null>(null);
  const canManage = role === Role.ADMIN || role === Role.PROCUREMENT_MANAGER;

  if (isLoading || !vendor) return <FullPageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-semibold">{vendor.companyName}</h2>
            <Badge status={vendor.status} />
            {vendor.isDuplicateFlagged && (
              <span className="badge bg-danger-light text-danger">
                <ShieldAlert size={12} /> Possible duplicate
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">
            {vendor.contactPerson} · {vendor.email} · {vendor.phone}
          </p>
        </div>

        {canManage && vendor.status === 'pending' && (
          <div className="flex gap-2">
            <button
              onClick={() => updateStatus.mutate({ id: vendor._id, status: 'verified' })}
              className="btn-primary"
            >
              <CheckCircle2 size={16} /> Verify
            </button>
            <button
              onClick={() => updateStatus.mutate({ id: vendor._id, status: 'rejected', rejectionReason: 'Did not meet verification criteria' })}
              className="btn-danger"
            >
              <XCircle size={16} /> Reject
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Company details" className="lg:col-span-2">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-muted">GST Number</dt><dd className="font-mono">{vendor.gstNumber || '—'}</dd></div>
            <div><dt className="text-muted">PAN Number</dt><dd className="font-mono">{vendor.panNumber || '—'}</dd></div>
            <div><dt className="text-muted">Category</dt><dd>{vendor.category || '—'}</dd></div>
            <div><dt className="text-muted">Registered on</dt><dd>{formatDate(vendor.createdAt)}</dd></div>
            <div className="col-span-2"><dt className="text-muted">Address</dt><dd>{vendor.address || '—'}</dd></div>
          </dl>

          {canManage && (
            <div className="mt-4 border-t border-border pt-4">
              <button
                onClick={() => checkDuplicates.mutate(vendor._id, { onSuccess: (r) => setDupResult(r) })}
                className="btn-secondary"
              >
                <ShieldAlert size={16} /> Run AI duplicate check
              </button>
              {dupResult && (
                <div className={`mt-3 flex items-start gap-2 rounded-md p-3 text-sm ${dupResult.isDuplicate ? 'bg-danger-light text-danger' : 'bg-success-light text-success'}`}>
                  <AIBadge />
                  <span>{dupResult.reason}</span>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card title="Documents">
          {vendor.documents.length === 0 && <p className="text-sm text-muted">No documents uploaded yet</p>}
          <ul className="space-y-2">
            {vendor.documents.map((doc, i) => (
              <li key={i}>
                <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                  {doc.label} ({doc.type.toUpperCase()})
                </a>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Performance ratings">
        <div className="mb-4 flex items-center gap-2">
          <Star className="fill-accent text-accent" size={18} />
          <span className="font-display text-lg font-semibold">{vendor.ratingAverage.toFixed(1)}</span>
          <span className="text-sm text-muted">({vendor.ratingCount} rating{vendor.ratingCount === 1 ? '' : 's'}) · Score {vendor.score}/100</span>
        </div>
        <div className="space-y-3">
          {(ratings ?? []).map((r) => (
            <div key={r._id} className="rounded-md border border-border p-3 text-sm">
              <div className="flex justify-between text-muted">
                <span>Delivery {r.delivery} · Quality {r.quality} · Support {r.support} · Cost {r.cost}</span>
                <span>{formatDate(r.createdAt)}</span>
              </div>
              {r.comment && <p className="mt-1 text-ink">{r.comment}</p>}
            </div>
          ))}
          {(ratings ?? []).length === 0 && <p className="text-sm text-muted">No ratings yet</p>}
        </div>
      </Card>
    </div>
  );
}
