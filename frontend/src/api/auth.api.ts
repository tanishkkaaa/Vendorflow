import { axiosClient } from './axiosClient';
import { ApiResponse, User } from '@/types';

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  registerOrganization: (payload: { orgName: string; name: string; email: string; password: string }) =>
    axiosClient.post<ApiResponse<AuthResult>>('/auth/register-organization', payload).then((r) => r.data.data),

  registerVendor: (
    organizationId: string,
    payload: { name: string; email: string; password: string; companyName: string; contactPerson: string; phone: string }
  ) =>
    axiosClient
      .post<ApiResponse<{ user: User; vendor: unknown; accessToken: string; refreshToken: string }>>(
        `/auth/register-vendor?organizationId=${organizationId}`,
        payload
      )
      .then((r) => r.data.data),

  login: (email: string, password: string) =>
    axiosClient.post<ApiResponse<AuthResult>>('/auth/login', { email, password }).then((r) => r.data.data),

  me: () => axiosClient.get<ApiResponse<User>>('/auth/me').then((r) => r.data.data),
};
