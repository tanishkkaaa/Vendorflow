import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useNotificationsList, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import { useAppSelector } from '@/app/hooks';
import { timeAgo } from '@/utils/format';
import clsx from 'clsx';

export default function NotificationsPage() {
  const { isLoading } = useNotificationsList();
  const { items } = useAppSelector((s) => s.notifications);
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">All notifications</p>
        <button onClick={() => markAllRead.mutate()} className="text-sm text-primary hover:underline">Mark all as read</button>
      </div>
      <Card>
        {isLoading ? null : items.length === 0 ? (
          <EmptyState title="No notifications yet" />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((n) => (
              <li key={n._id} className={clsx('py-3', !n.isRead && 'bg-primary-light/30 -mx-5 px-5')}>
                <p className="text-sm font-medium text-ink">{n.title}</p>
                <p className="mt-0.5 text-sm text-muted">{n.message}</p>
                <p className="mt-1 text-xs text-muted/70">{timeAgo(n.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
