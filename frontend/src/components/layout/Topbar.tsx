import { Bell, LogOut, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { useLogout } from '@/hooks/useAuth';
import { useNotificationsList, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import { ROLE_LABELS } from '@/constants/roles';
import { timeAgo } from '@/utils/format';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

export function Topbar({ title }: { title: string }) {
  const user = useAppSelector((s) => s.auth.user);
  const { items, unreadCount } = useAppSelector((s) => s.notifications);
  const logout = useLogout();
  const markAllRead = useMarkAllNotificationsRead();
  const [notifOpen, setNotifOpen] = useState(false);
  useNotificationsList();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="font-display text-xl font-semibold">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative rounded-full p-2 text-muted hover:bg-surface hover:text-ink"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="card absolute right-0 top-12 z-40 w-80 p-0"
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span className="text-sm font-semibold">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={() => markAllRead.mutate()} className="text-xs text-primary hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {items.length === 0 && <p className="px-4 py-6 text-center text-sm text-muted">No notifications yet</p>}
                  {items.slice(0, 15).map((n) => (
                    <div key={n._id} className={clsx('border-b border-border px-4 py-3 last:border-0', !n.isRead && 'bg-primary-light/40')}>
                      <p className="text-sm font-medium text-ink">{n.title}</p>
                      <p className="mt-0.5 text-xs text-muted">{n.message}</p>
                      <p className="mt-1 text-[11px] text-muted/70">{timeAgo(n.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 border-l border-border pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-primary">
            <UserIcon size={16} />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-ink">{user?.name}</p>
            <p className="text-xs text-muted">{user && ROLE_LABELS[user.role]}</p>
          </div>
          <button onClick={logout} className="ml-2 rounded p-1.5 text-muted hover:bg-surface hover:text-danger" title="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
