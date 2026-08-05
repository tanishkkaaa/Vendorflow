import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useSubmitQuotation } from '@/hooks/useQuotations';

interface FormValues {
  price: string;
  deliveryTimelineDays: string;
  warrantyMonths: string;
  file: FileList;
}

export function SubmitQuotationModal({ rfqId, open, onClose }: { rfqId: string; open: boolean; onClose: () => void }) {
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const submit = useSubmitQuotation();

  const onSubmit = (values: FormValues) => {
    const file = values.file?.[0];
    if (!file) return;
    submit.mutate(
      {
        rfqId,
        price: Number(values.price),
        deliveryTimelineDays: Number(values.deliveryTimelineDays),
        warrantyMonths: values.warrantyMonths ? Number(values.warrantyMonths) : undefined,
        file,
      },
      { onSuccess: () => { reset(); onClose(); } }
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Submit quotation" width="max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Quotation PDF</label>
          <input type="file" accept=".pdf" className="input" {...register('file', { required: true })} />
          <p className="mt-1 text-xs text-muted">Our AI will automatically extract price, warranty, delivery and terms from this PDF.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Price (₹)</label><input className="input" type="number" {...register('price', { required: true })} /></div>
          <div><label className="label">Delivery (days)</label><input className="input" type="number" {...register('deliveryTimelineDays', { required: true })} /></div>
        </div>
        <div><label className="label">Warranty (months)</label><input className="input" type="number" {...register('warrantyMonths')} /></div>

        {submit.isError && (
          <p className="rounded-md bg-danger-light px-3 py-2 text-sm text-danger">
            {(submit.error as any)?.response?.data?.message ?? 'Submission failed.'}
          </p>
        )}

        <div className="flex gap-2 border-t border-border pt-4">
          <button type="submit" disabled={submit.isPending} className="btn-primary">
            {submit.isPending && <Spinner className="h-4 w-4 text-white" />} Submit quotation
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </Modal>
  );
}
