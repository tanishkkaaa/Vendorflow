import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { connectSocket, getSocket } from '@/lib/socket';
import { receiveRealtimeNotification } from '@/features/notifications/notificationsSlice';
import { AppNotification } from '@/types';
import { toast } from 'sonner';

/** Connects the socket (if not already) on mount and wires real-time notification toasts. */
export function useSocketNotifications() {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!accessToken) return;
    const socket = getSocket() ?? connectSocket(accessToken);

    const handler = (notification: AppNotification) => {
      dispatch(receiveRealtimeNotification(notification));
      toast(notification.title, { description: notification.message });
    };

    socket.on('notification:new', handler);
    return () => {
      socket.off('notification:new', handler);
    };
  }, [accessToken, dispatch]);
}
