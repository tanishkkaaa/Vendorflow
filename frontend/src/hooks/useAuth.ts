import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials, logout as logoutAction } from '@/features/auth/authSlice';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { useNavigate } from 'react-router-dom';

export function useLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: { email: string; password: string }) => authApi.login(payload.email, payload.password),
    onSuccess: (result) => {
      dispatch(setCredentials(result));
      connectSocket(result.accessToken);
      navigate('/dashboard');
    },
  });
}

export function useRegisterOrganization() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: authApi.registerOrganization,
    onSuccess: (result) => {
      dispatch(setCredentials(result));
      connectSocket(result.accessToken);
      navigate('/dashboard');
    },
  });
}

export function useRegisterVendor() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: {
      organizationId: string;
      name: string;
      email: string;
      password: string;
      companyName: string;
      contactPerson: string;
      phone: string;
    }) => authApi.registerVendor(payload.organizationId, payload),
    onSuccess: () => navigate('/login'),
  });
}

export function useLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  return () => {
    dispatch(logoutAction());
    disconnectSocket();
    navigate('/login');
  };
}
