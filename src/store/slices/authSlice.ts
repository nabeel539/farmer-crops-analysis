import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  role: 'ADMIN' | 'FIELD_OFFICER' | 'FARMER';
  is_active: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

const getInitialToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('krishi_token');
  }
  return null;
};

const getInitialUser = (): AuthUser | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('krishi_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
};

const initialState: AuthState = {
  user: getInitialUser(),
  token: getInitialToken(),
  isAuthenticated: Boolean(getInitialToken()),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; access_token: string }>
    ) => {
      const { user, access_token } = action.payload;
      state.user = user;
      state.token = access_token;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('krishi_token', access_token);
        localStorage.setItem('krishi_user', JSON.stringify(user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('krishi_token');
        localStorage.removeItem('krishi_user');
      }
    },
    updateUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('krishi_user', JSON.stringify(action.payload));
      }
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
