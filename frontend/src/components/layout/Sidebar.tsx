import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  FileText,
  ClipboardCheck,
  FileSignature,
  ShoppingCart,
  ScrollText,
  ChevronsLeft,
  UserCircle,
} from 'lucide-react';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toggleSidebar } from '@/features/ui/uiSlice';
import { Role } from '@/constants/roles';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: null },
  { to: '/vendor-profile', label: 'My Profile', icon: UserCircle, roles: [Role.VENDOR] },
  { to: '/vendors', label: 'Vendors', icon: Building2, roles: [Role.ADMIN, Role.PROCUREMENT_MANAGER, Role.FINANCE] },
  { to: '/rfqs', label: 'RFQs', icon: FileText, roles: [Role.ADMIN, Role.PROCUREMENT_MANAGER, Role.FINANCE, Role.VENDOR] },
  { to: '/approvals', label: 'Approvals', icon: ClipboardCheck, roles: [Role.ADMIN, Role.PROCUREMENT_MANAGER, Role.FINANCE, Role.DIRECTOR, Role.APPROVER] },
  { to: '/contracts', label: 'Contracts', icon: FileSignature, roles: [Role.ADMIN, Role.PROCUREMENT_MANAGER, Role.FINANCE] },
  { to: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart, roles: [Role.ADMIN, Role.PROCUREMENT_MANAGER, Role.FINANCE, Role.VENDOR] },
  { to: '/audit-logs', label: 'Audit Logs', icon: ScrollText, roles: [Role.ADMIN] },
];

export function Sidebar() {
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const role = useAppSelector((s) => s.auth.user?.role);
  const dispatch = useAppDispatch();

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || (role && item.roles.includes(role)));

  return (
    <aside className={clsx('flex h-screen flex-col bg-ink text-white/80 transition-all', collapsed ? 'w-[72px]' : 'w-60')}>
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary font-display font-bold text-accent">
          V
        </div>
        {!collapsed && <span className="font-display text-lg font-semibold text-white">VendorFlow</span>}
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
              )
            }
          >
            <item.icon size={18} className="shrink-0" />
            {!collapsed && item.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => dispatch(toggleSidebar())}
        className="mx-2 mb-4 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/50 hover:bg-white/5 hover:text-white"
      >
        <ChevronsLeft size={18} className={clsx('transition-transform', collapsed && 'rotate-180')} />
        {!collapsed && 'Collapse'}
      </button>
    </aside>
  );
}
