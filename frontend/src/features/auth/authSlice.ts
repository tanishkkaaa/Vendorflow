import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

function loadPersisted(): AuthState {
  try {
    const raw = localStorage.getItem('vf_auth');
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt storage
  }
  return { user: null, accessToken: null, refreshToken: null };
}

function persist(state: AuthState) {
  localStorage.setItem('vf_auth', JSON.stringify(state));
}

const authSlice = createSlice({
  name: 'auth',
  initialState: loadPersisted(),
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      persist(state);
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      persist(state);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem('vf_auth');
    },
  },
});

export const { setCredentials, setTokens, logout } = authSlice.actions;
export default authSlice.reducer;
