import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppNotification } from '@/types';

interface NotificationsState {
  items: AppNotification[];
  unreadCount: number;
}

const initialState: NotificationsState = { items: [], unreadCount: 0 };

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<{ items: AppNotification[]; unreadCount: number }>) => {
      state.items = action.payload.items;
      state.unreadCount = action.payload.unreadCount;
    },
    receiveRealtimeNotification: (state, action: PayloadAction<AppNotification>) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    markAllReadLocally: (state) => {
      state.items = state.items.map((n) => ({ ...n, isRead: true }));
      state.unreadCount = 0;
    },
  },
});

export const { setNotifications, receiveRealtimeNotification, markAllReadLocally } = notificationsSlice.actions;
export default notificationsSlice.reducer;
