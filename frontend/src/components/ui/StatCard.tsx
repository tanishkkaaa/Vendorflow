import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
  sublabel,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: boolean;
  sublabel?: string;
}) {
  return (
    <div className="card flex items-start justify-between p-5">
      <div>
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold text-ink">{value}</p>
        {sublabel && <p className="mt-1 text-xs text-muted">{sublabel}</p>}
      </div>
      <div className={clsx('rounded-lg p-2.5', accent ? 'bg-accent-light text-accent-dark' : 'bg-primary-light text-primary')}>
        <Icon size={20} />
      </div>
    </div>
  );
}
