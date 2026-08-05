import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useSocketNotifications } from '@/hooks/useSocket';

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/vendors': 'Vendors',
  '/rfqs': 'RFQs',
  '/approvals': 'Approvals',
  '/contracts': 'Contracts',
  '/purchase-orders': 'Purchase Orders',
  '/audit-logs': 'Audit Logs',
};

function resolveTitle(pathname: string): string {
  const match = Object.keys(TITLES).find((key) => pathname.startsWith(key));
  return match ? TITLES[match] : 'VendorFlow AI';
}

export function AppLayout() {
  const location = useLocation();
  useSocketNotifications();

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={resolveTitle(location.pathname)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
