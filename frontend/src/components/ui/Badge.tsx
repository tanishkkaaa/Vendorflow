import { STATUS_COLORS } from '@/constants/enums';
import { statusLabel } from '@/utils/format';
import clsx from 'clsx';

export function Badge({ status, children, className }: { status?: string; children?: React.ReactNode; className?: string }) {
  const colorClass = status ? STATUS_COLORS[status] ?? 'bg-border text-muted' : 'bg-border text-muted';
  return <span className={clsx('badge', colorClass, className)}>{children ?? (status ? statusLabel(status) : '')}</span>;
}
