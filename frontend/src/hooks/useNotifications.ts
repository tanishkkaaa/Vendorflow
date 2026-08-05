import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/api/notification.api';
import { useAppDispatch } from '@/app/hooks';
import { setNotifications, markAllReadLocally } from '@/features/notifications/notificationsSlice';
import { useEffect } from 'react';

export function useNotificationsList() {
  const dispatch = useAppDispatch();
  const query = useQuery({ queryKey: ['notifications'], queryFn: () => notificationApi.list({ limit: 30 }) });

  useEffect(() => {
    if (query.data) dispatch(setNotifications(query.data));
  }, [query.data, dispatch]);

  return query;
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => {
      dispatch(markAllReadLocally());
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
