import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '@/app/store';
import { logout, setTokens } from '@/features/auth/authSlice';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1',
});

axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

axiosClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingQueue.push(() => resolve(axiosClient(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = store.getState().auth.refreshToken;
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axiosClient.post('/auth/refresh', { refreshToken });
        store.dispatch(setTokens({ accessToken: data.data.accessToken, refreshToken: data.data.refreshToken }));
        pendingQueue.forEach((cb) => cb());
        pendingQueue = [];
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
