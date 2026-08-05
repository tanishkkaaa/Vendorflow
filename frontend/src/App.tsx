import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Role } from '@/constants/roles';

import Login from '@/pages/auth/Login';
import RegisterOrganization from '@/pages/auth/RegisterOrganization';
import RegisterVendor from '@/pages/auth/RegisterVendor';

import Dashboard from '@/pages/dashboard/Dashboard';

import VendorList from '@/pages/vendors/VendorList';
import VendorDetail from '@/pages/vendors/VendorDetail';
import VendorProfile from '@/pages/vendors/VendorProfile';

import RFQList from '@/pages/rfq/RFQList';
import RFQCreate from '@/pages/rfq/RFQCreate';
import RFQDetail from '@/pages/rfq/RFQDetail';

import ApprovalQueue from '@/pages/approvals/ApprovalQueue';
import ApprovalDetail from '@/pages/approvals/ApprovalDetail';

import ContractList from '@/pages/contracts/ContractList';
import ContractDetail from '@/pages/contracts/ContractDetail';

import PurchaseOrderList from '@/pages/purchaseOrders/PurchaseOrderList';
import PurchaseOrderDetail from '@/pages/purchaseOrders/PurchaseOrderDetail';

import NotificationsPage from '@/pages/notifications/NotificationsPage';
import AuditLogPage from '@/pages/auditLogs/AuditLogPage';
import NotFound from '@/pages/NotFound';

const MANAGE_ROLES = [Role.ADMIN, Role.PROCUREMENT_MANAGER];
const FINANCE_ROLES = [Role.ADMIN, Role.PROCUREMENT_MANAGER, Role.FINANCE];
const APPROVAL_ROLES = [Role.ADMIN, Role.PROCUREMENT_MANAGER, Role.FINANCE, Role.DIRECTOR, Role.APPROVER];

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register-organization" element={<RegisterOrganization />} />
      <Route path="/register-vendor" element={<RegisterVendor />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route element={<ProtectedRoute allowedRoles={FINANCE_ROLES} />}>
            <Route path="/vendors" element={<VendorList />} />
            <Route path="/vendors/:id" element={<VendorDetail />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={[Role.VENDOR]} />}>
            <Route path="/vendor-profile" element={<VendorProfile />} />
          </Route>

          <Route path="/rfqs" element={<RFQList />} />
          <Route path="/rfqs/:id" element={<RFQDetail />} />
          <Route element={<ProtectedRoute allowedRoles={MANAGE_ROLES} />}>
            <Route path="/rfqs/new" element={<RFQCreate />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={APPROVAL_ROLES} />}>
            <Route path="/approvals" element={<ApprovalQueue />} />
            <Route path="/approvals/:id" element={<ApprovalDetail />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={FINANCE_ROLES} />}>
            <Route path="/contracts" element={<ContractList />} />
            <Route path="/contracts/:id" element={<ContractDetail />} />
          </Route>

          <Route path="/purchase-orders" element={<PurchaseOrderList />} />
          <Route path="/purchase-orders/:id" element={<PurchaseOrderDetail />} />

          <Route path="/notifications" element={<NotificationsPage />} />

          <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} />}>
            <Route path="/audit-logs" element={<AuditLogPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
