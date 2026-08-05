import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { Role } from '@/constants/roles';

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: Role[] }) {
  const { user, accessToken } = useAppSelector((s) => s.auth);

  if (!accessToken || !user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
