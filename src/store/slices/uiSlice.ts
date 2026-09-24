import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserRole } from '@/types';
import { CURRENT_USER } from '@/data/mockData';

interface UIState {
  currentUser: User;
  activeRole: UserRole;
  sidebarOpen: boolean;
  selectedLanguage: 'EN' | 'UR';
  theme: 'light' | 'dark' | 'system';
  quickActionModalOpen: boolean;
}

const initialState: UIState = {
  currentUser: CURRENT_USER,
  activeRole: CURRENT_USER.role,
  sidebarOpen: true,
  selectedLanguage: 'EN',
  theme: 'light',
  quickActionModalOpen: false
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.activeRole = action.payload.role;
    },
    setActiveRole: (state, action: PayloadAction<UserRole>) => {
      state.activeRole = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setSelectedLanguage: (state, action: PayloadAction<'EN' | 'UR'>) => {
      state.selectedLanguage = action.payload;
    },
    setThemeMode: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    setQuickActionModalOpen: (state, action: PayloadAction<boolean>) => {
      state.quickActionModalOpen = action.payload;
    }
  }
});

export const {
  setCurrentUser,
  setActiveRole,
  toggleSidebar,
  setSidebarOpen,
  setSelectedLanguage,
  setThemeMode,
  setQuickActionModalOpen
} = uiSlice.actions;

export default uiSlice.reducer;
