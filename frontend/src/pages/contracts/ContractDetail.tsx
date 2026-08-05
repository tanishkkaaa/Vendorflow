import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FullPageSpinner, Spinner } from '@/components/ui/Spinner';
import { AIBadge } from '@/components/ui/AIBadge';
import { useContract, useUploadContractVersion } from '@/hooks/useContracts';
import { formatCurrency, formatDate } from '@/utils/format';
import { AlertTriangle, UploadCloud, Building2 } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Role } from '@/constants/roles';
import { Vendor } from '@/types';

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: contract, isLoading } = useContract(id);
  const uploadVersion = useUploadContractVersion();
  const role = useAppSelector((s) => s.auth.user?.role);
  const canManage = role === Role.ADMIN || role === Role.PROCUREMENT_MANAGER;
  const [changeNote, setChangeNote] = useState('');
  const [newEndDate, setNewEndDate] = useState('');

  if (isLoading || !contract) return <FullPageSpinner />;
  const vendorName = typeof contract.vendorId === 'object' ? (contract.vendorId as Vendor).companyName : contract.vendorId;
  const latestVersion = contract.versions.find((v) => v.version === contract.currentVersion) ?? contract.versions[contract.versions.length - 1];

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadVersion.mutate({ id: contract._id, file, changeNote: changeNote || undefined, newEndDate: newEndDate || undefined });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-semibold">{contract.title}</h2>
            <Badge status={contract.status} />
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted"><Building2 size={14} /> {vendorName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Contract details" className="lg:col-span-2">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-muted">Value</dt><dd>{contract.contractValue ? formatCurrency(contract.contractValue) : '—'}</dd></div>
            <div><dt className="text-muted">Current version</dt><dd>v{contract.currentVersion}</dd></div>
            <div><dt className="text-muted">Start date</dt><dd>{formatDate(contract.startDate)}</dd></div>
            <div><dt className="text-muted">End date</dt><dd>{formatDate(contract.endDate)}</dd></div>
            <div><dt className="text-muted">Reminder</dt><dd>{contract.reminderDaysBefore} days before expiry</dd></div>
          </dl>

          {latestVersion?.aiSummary ? (
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              <div className="flex items-start gap-2 rounded-md bg-primary-light p-3 text-sm">
                <AIBadge label="AI Summary" />
                <p>{latestVersion.aiSummary}</p>
              </div>
              {(latestVersion.aiRiskFlags?.length ?? 0) > 0 && (
                <div className="rounded-md bg-danger-light p-3 text-sm text-danger">
                  <p className="mb-1 flex items-center gap-1 font-medium"><AlertTriangle size={14} /> Risk flags</p>
                  <ul className="list-inside list-disc">{latestVersion.aiRiskFlags!.map((f, i) => <li key={i}>{f}</li>)}</ul>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-sm text-muted">
              <Spinner className="h-4 w-4" /> AI is summarizing this contract...
            </div>
          )}
        </Card>

        <Card title="Version history">
          <ul className="space-y-3">
            {[...contract.versions].reverse().map((v) => (
              <li key={v.version} className="rounded-md border border-border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">v{v.version}</span>
                  <a href={v.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">View PDF</a>
                </div>
                <p className="mt-1 text-xs text-muted">{formatDate(v.uploadedAt)}</p>
                {v.changeNote && <p className="mt-1 text-xs text-ink">{v.changeNote}</p>}
              </li>
            ))}
          </ul>

          {canManage && (
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              <input className="input" placeholder="Change note (optional)" value={changeNote} onChange={(e) => setChangeNote(e.target.value)} />
              <input className="input" type="date" placeholder="New end date (renewal)" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} />
              <label className="btn-secondary w-full cursor-pointer justify-center">
                <UploadCloud size={16} /> Upload new version
                <input type="file" accept=".pdf" className="hidden" onChange={handleFileSelected} />
              </label>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
