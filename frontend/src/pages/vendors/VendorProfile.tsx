import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FullPageSpinner, Spinner } from '@/components/ui/Spinner';
import { useMyVendorProfile, useUploadVendorDocument } from '@/hooks/useVendors';
import { vendorApi } from '@/api/vendor.api';
import { useQueryClient } from '@tanstack/react-query';
import { UploadCloud } from 'lucide-react';

interface ProfileForm {
  companyName: string;
  contactPerson: string;
  phone: string;
  gstNumber: string;
  panNumber: string;
  address: string;
}

export default function VendorProfile() {
  const { data: vendor, isLoading } = useMyVendorProfile();
  const qc = useQueryClient();
  const uploadDoc = useUploadVendorDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState('gst');
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm<ProfileForm>({
    values: vendor
      ? {
          companyName: vendor.companyName,
          contactPerson: vendor.contactPerson,
          phone: vendor.phone,
          gstNumber: vendor.gstNumber ?? '',
          panNumber: vendor.panNumber ?? '',
          address: vendor.address ?? '',
        }
      : undefined,
  });

  if (isLoading || !vendor) return <FullPageSpinner />;

  const onSubmit = async (values: ProfileForm) => {
    setSaving(true);
    try {
      await vendorApi.updateProfile(vendor._id, values);
      qc.invalidateQueries({ queryKey: ['vendor', 'me'] });
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadDoc.mutate({ id: vendor._id, file, type: docType, label: file.name });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-xl font-semibold">My Vendor Profile</h2>
        <Badge status={vendor.status} />
      </div>

      <Card title="Company details">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className="label">Company name</label><input className="input" {...register('companyName')} /></div>
          <div><label className="label">Contact person</label><input className="input" {...register('contactPerson')} /></div>
          <div><label className="label">Phone</label><input className="input" {...register('phone')} /></div>
          <div><label className="label">GST Number</label><input className="input font-mono" {...register('gstNumber')} /></div>
          <div><label className="label">PAN Number</label><input className="input font-mono" {...register('panNumber')} /></div>
          <div className="sm:col-span-2"><label className="label">Address</label><textarea className="input" rows={2} {...register('address')} /></div>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Spinner className="h-4 w-4 text-white" />} Save changes
            </button>
            <button type="button" onClick={() => reset()} className="btn-secondary">Reset</button>
          </div>
          <p className="text-xs text-muted sm:col-span-2">Editing your profile after verification will move it back to Pending for re-review.</p>
        </form>
      </Card>

      <Card title="Documents">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select className="input w-auto" value={docType} onChange={(e) => setDocType(e.target.value)}>
            <option value="gst">GST Certificate</option>
            <option value="pan">PAN Card</option>
            <option value="certificate">Company Certificate</option>
            <option value="bank_proof">Bank Proof</option>
            <option value="other">Other</option>
          </select>
          <button onClick={() => fileInputRef.current?.click()} className="btn-secondary">
            <UploadCloud size={16} /> Upload document
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleFileSelected} />
        </div>

        <ul className="space-y-2">
          {vendor.documents.map((doc, i) => (
            <li key={i} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
              <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">{doc.label}</a>
              <span className="text-xs uppercase text-muted">{doc.type}</span>
            </li>
          ))}
          {vendor.documents.length === 0 && <p className="text-sm text-muted">No documents uploaded yet</p>}
        </ul>
      </Card>
    </div>
  );
}
