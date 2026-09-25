import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserRole } from '@/types';
import { CURRENT_USER } from '@/data/mockData';

export interface GISPolygonSettings {
  defaultPointsCount: 4 | 6 | 8;
  polygonColorHealthy: string;
  polygonColorWarning: string;
  polygonColorCritical: string;
  polygonColorHarvested: string;
  polygonOpacity: number;
  strokeWeight: number;
}

interface UIState {
  currentUser: User;
  activeRole: UserRole;
  sidebarOpen: boolean;
  selectedLanguage: 'EN' | 'UR';
  theme: 'light' | 'dark' | 'system';
  quickActionModalOpen: boolean;
  gisSettings: GISPolygonSettings;
}

const getInitialGISSettings = (): GISPolygonSettings => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('krishi_gis_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // use default
      }
    }
  }
  return {
    defaultPointsCount: 4,
    polygonColorHealthy: '#10b981',
    polygonColorWarning: '#f59e0b',
    polygonColorCritical: '#ef4444',
    polygonColorHarvested: '#3b82f6',
    polygonOpacity: 0.35,
    strokeWeight: 3,
  };
};

const initialState: UIState = {
  currentUser: CURRENT_USER,
  activeRole: CURRENT_USER.role,
  sidebarOpen: true,
  selectedLanguage: 'EN',
  theme: 'light',
  quickActionModalOpen: false,
  gisSettings: getInitialGISSettings(),
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
    },
    updateGISSettings: (state, action: PayloadAction<Partial<GISPolygonSettings>>) => {
      state.gisSettings = { ...state.gisSettings, ...action.payload };
      if (typeof window !== 'undefined') {
        localStorage.setItem('krishi_gis_settings', JSON.stringify(state.gisSettings));
      }
    },
    resetGISSettings: (state) => {
      const defaultSettings: GISPolygonSettings = {
        defaultPointsCount: 4,
        polygonColorHealthy: '#10b981',
        polygonColorWarning: '#f59e0b',
        polygonColorCritical: '#ef4444',
        polygonColorHarvested: '#3b82f6',
        polygonOpacity: 0.35,
        strokeWeight: 3,
      };
      state.gisSettings = defaultSettings;
      if (typeof window !== 'undefined') {
        localStorage.setItem('krishi_gis_settings', JSON.stringify(defaultSettings));
      }
    },
  },
});

export const {
  setCurrentUser,
  setActiveRole,
  toggleSidebar,
  setSidebarOpen,
  setSelectedLanguage,
  setThemeMode,
  setQuickActionModalOpen,
  updateGISSettings,
  resetGISSettings,
} = uiSlice.actions;

export default uiSlice.reducer;
