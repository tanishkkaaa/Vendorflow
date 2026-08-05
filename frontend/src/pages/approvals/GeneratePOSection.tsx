import { useFieldArray, useForm } from 'react-hook-form';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { AIBadge } from '@/components/ui/AIBadge';
import { useGeneratePurchaseOrder } from '@/hooks/usePurchaseOrders';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FormValues {
  items: { name: string; quantity: number; unitPrice: number }[];
  deliveryDate: string;
  paymentTerms: string;
}

export function GeneratePOSection({ purchaseRequestId }: { purchaseRequestId: string }) {
  const generate = useGeneratePurchaseOrder();
  const { register, control, handleSubmit } = useForm<FormValues>({
    defaultValues: { items: [{ name: '', quantity: 1, unitPrice: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const onSubmit = (values: FormValues) => {
    generate.mutate({
      purchaseRequestId,
      items: values.items.map((i) => ({ ...i, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })),
      deliveryDate: values.deliveryDate || undefined,
      paymentTerms: values.paymentTerms || undefined,
    });
  };

  if (generate.isSuccess) {
    return (
      <Card title="Purchase order generated">
        <div className="flex items-start gap-2 rounded-md bg-success-light p-3 text-sm text-success">
          <AIBadge label="AI Summary" />
          <p>{generate.data.aiSummary}</p>
        </div>
        <p className="mt-3 text-sm">
          PO <span className="font-mono">{generate.data.poNumber}</span> generated and emailed to the vendor.
        </p>
        <Link to={`/purchase-orders/${generate.data._id}`} className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          View purchase order <ExternalLink size={14} />
        </Link>
      </Card>
    );
  }

  return (
    <Card title="Generate purchase order">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="label mb-0">Line items</label>
            <button type="button" onClick={() => append({ name: '', quantity: 1, unitPrice: 0 })} className="btn-ghost text-xs">
              <Plus size={14} /> Add item
            </button>
          </div>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
                <input className="input" placeholder="Item name" {...register(`items.${index}.name` as const, { required: true })} />
                <input className="input" type="number" min={1} placeholder="Qty" {...register(`items.${index}.quantity` as const, { required: true })} />
                <input className="input" type="number" min={0} placeholder="Unit price (₹)" {...register(`items.${index}.unitPrice` as const, { required: true })} />
                <button type="button" onClick={() => remove(index)} className="btn-ghost text-danger" disabled={fields.length === 1}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className="label">Delivery date</label><input className="input" type="date" {...register('deliveryDate')} /></div>
          <div><label className="label">Payment terms</label><input className="input" placeholder="50% advance, 50% on delivery" {...register('paymentTerms')} /></div>
        </div>

        <p className="text-xs text-muted">A PDF will be generated, an AI summary embedded, and the vendor emailed automatically.</p>

        <button type="submit" disabled={generate.isPending} className="btn-primary">
          {generate.isPending && <Spinner className="h-4 w-4 text-white" />} Generate & send purchase order
        </button>
      </form>
    </Card>
  );
}
