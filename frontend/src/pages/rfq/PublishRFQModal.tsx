import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useVendors } from '@/hooks/useVendors';
import { usePublishRFQ } from '@/hooks/useRFQs';

export function PublishRFQModal({ rfqId, open, onClose }: { rfqId: string; open: boolean; onClose: () => void }) {
  const { data } = useVendors({ status: 'verified', limit: 100 });
  const [selected, setSelected] = useState<string[]>([]);
  const publish = usePublishRFQ();

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((v) => v !== id) : [...s, id]));

  const handlePublish = () => {
    publish.mutate({ id: rfqId, vendorIds: selected }, { onSuccess: onClose });
  };

  return (
    <Modal open={open} onClose={onClose} title="Invite vendors" width="max-w-md">
      <p className="mb-3 text-sm text-muted">Select verified vendors to invite to this RFQ.</p>
      <div className="max-h-72 space-y-1 overflow-y-auto">
        {(data?.items ?? []).map((v) => (
          <label key={v._id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-surface">
            <input type="checkbox" checked={selected.includes(v._id)} onChange={() => toggle(v._id)} />
            {v.companyName}
          </label>
        ))}
        {(data?.items ?? []).length === 0 && <p className="py-4 text-center text-sm text-muted">No verified vendors available</p>}
      </div>
      <div className="mt-4 flex gap-2 border-t border-border pt-4">
        <button onClick={handlePublish} disabled={selected.length === 0 || publish.isPending} className="btn-primary">
          {publish.isPending && <Spinner className="h-4 w-4 text-white" />} Publish & invite ({selected.length})
        </button>
        <button onClick={onClose} className="btn-secondary">Cancel</button>
      </div>
    </Modal>
  );
}
