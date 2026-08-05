import { axiosClient } from './axiosClient';
import { ApiResponse, AppNotification } from '@/types';

export const notificationApi = {
  list: (params: Record<string, unknown> = {}) =>
    axiosClient.get<ApiResponse<AppNotification[]>>('/notifications', { params }).then((r) => ({
      items: r.data.data,
      unreadCount: (r.data.meta?.unreadCount as number) ?? 0,
    })),

  markRead: (id: string) => axiosClient.patch(`/notifications/${id}/read`),
  markAllRead: () => axiosClient.patch('/notifications/read-all'),
};
