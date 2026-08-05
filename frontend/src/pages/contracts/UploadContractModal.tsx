import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useVendors } from '@/hooks/useVendors';
import { useCreateContract } from '@/hooks/useContracts';

interface FormValues {
  vendorId: string;
  title: string;
  contractValue: string;
  startDate: string;
  endDate: string;
  reminderDaysBefore: string;
  file: FileList;
}

export function UploadContractModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: vendors } = useVendors({ status: 'verified', limit: 100 });
  const { register, handleSubmit, reset } = useForm<FormValues>({ defaultValues: { reminderDaysBefore: '30' } });
  const createContract = useCreateContract();

  const onSubmit = (values: FormValues) => {
    const file = values.file?.[0];
    if (!file) return;
    createContract.mutate(
      {
        vendorId: values.vendorId,
        title: values.title,
        contractValue: values.contractValue ? Number(values.contractValue) : undefined,
        startDate: values.startDate,
        endDate: values.endDate,
        reminderDaysBefore: Number(values.reminderDaysBefore),
        file,
      },
      { onSuccess: () => { reset(); onClose(); } }
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Upload contract" width="max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Vendor</label>
          <select className="input" {...register('vendorId', { required: true })}>
            <option value="">Select vendor</option>
            {(vendors?.items ?? []).map((v) => <option key={v._id} value={v._id}>{v.companyName}</option>)}
          </select>
        </div>
        <div><label className="label">Title</label><input className="input" placeholder="Annual IT Hardware Supply Agreement" {...register('title', { required: true })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Start date</label><input className="input" type="date" {...register('startDate', { required: true })} /></div>
          <div><label className="label">End date</label><input className="input" type="date" {...register('endDate', { required: true })} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Contract value (₹)</label><input className="input" type="number" {...register('contractValue')} /></div>
          <div><label className="label">Reminder (days before)</label><input className="input" type="number" {...register('reminderDaysBefore')} /></div>
        </div>
        <div>
          <label className="label">Contract PDF</label>
          <input type="file" accept=".pdf" className="input" {...register('file', { required: true })} />
          <p className="mt-1 text-xs text-muted">AI will summarize the contract and flag risky clauses automatically.</p>
        </div>

        <div className="flex gap-2 border-t border-border pt-4">
          <button type="submit" disabled={createContract.isPending} className="btn-primary">
            {createContract.isPending && <Spinner className="h-4 w-4 text-white" />} Upload contract
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </Modal>
  );
}
