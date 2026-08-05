import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useCreateRFQ } from '@/hooks/useRFQs';
import { Plus, Trash2 } from 'lucide-react';

interface FormValues {
  title: string;
  department: string;
  budget: string;
  deliveryDate: string;
  submissionDeadline: string;
  specifications: string;
  items: { name: string; quantity: number; specifications?: string }[];
}

export default function RFQCreate() {
  const navigate = useNavigate();
  const createRFQ = useCreateRFQ();
  const { register, control, handleSubmit } = useForm<FormValues>({
    defaultValues: { items: [{ name: '', quantity: 1, specifications: '' }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const onSubmit = (values: FormValues) => {
    createRFQ.mutate(
      {
        title: values.title,
        department: values.department || undefined,
        budget: values.budget ? Number(values.budget) : undefined,
        deliveryDate: values.deliveryDate ? new Date(values.deliveryDate) as any : undefined,
        submissionDeadline: values.submissionDeadline ? new Date(values.submissionDeadline) as any : undefined,
        specifications: values.specifications || undefined,
        items: values.items.map((i) => ({ ...i, quantity: Number(i.quantity) })),
      },
      { onSuccess: (rfq) => navigate(`/rfqs/${rfq._id}`) }
    );
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Card title="Create RFQ">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label">Title</label>
            <input className="input" placeholder="Procurement of 50 laptops" {...register('title', { required: true })} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div><label className="label">Department</label><input className="input" placeholder="IT" {...register('department')} /></div>
            <div><label className="label">Budget (₹)</label><input className="input" type="number" {...register('budget')} /></div>
            <div><label className="label">Delivery date</label><input className="input" type="date" {...register('deliveryDate')} /></div>
          </div>

          <div>
            <label className="label">Submission deadline</label>
            <input className="input max-w-xs" type="date" {...register('submissionDeadline')} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="label mb-0">Items</label>
              <button type="button" onClick={() => append({ name: '', quantity: 1, specifications: '' })} className="btn-ghost text-xs">
                <Plus size={14} /> Add item
              </button>
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 gap-2 rounded-md border border-border p-3 sm:grid-cols-[2fr_1fr_2fr_auto]">
                  <input className="input" placeholder="Item name" {...register(`items.${index}.name` as const, { required: true })} />
                  <input className="input" type="number" min={1} placeholder="Qty" {...register(`items.${index}.quantity` as const, { required: true })} />
                  <input className="input" placeholder="Specifications (optional)" {...register(`items.${index}.specifications` as const)} />
                  <button type="button" onClick={() => remove(index)} className="btn-ghost text-danger" disabled={fields.length === 1}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="label">General specifications / notes</label>
            <textarea className="input" rows={3} {...register('specifications')} />
          </div>

          <div className="flex gap-2 border-t border-border pt-4">
            <button type="submit" disabled={createRFQ.isPending} className="btn-primary">
              {createRFQ.isPending && <Spinner className="h-4 w-4 text-white" />} Create RFQ
            </button>
            <button type="button" onClick={() => navigate('/rfqs')} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
