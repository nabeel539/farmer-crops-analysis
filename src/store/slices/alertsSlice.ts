import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AgriAlert } from '@/types';
import { MOCK_ALERTS } from '@/data/mockData';

interface AlertsState {
  alerts: AgriAlert[];
  severityFilter: string;
}

const initialState: AlertsState = {
  alerts: MOCK_ALERTS,
  severityFilter: 'ALL'
};

export const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    addAlert: (state, action: PayloadAction<AgriAlert>) => {
      state.alerts.unshift(action.payload);
    },
    resolveAlert: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find(a => a.id === action.payload);
      if (alert) {
        alert.resolved = true;
      }
    },
    dismissAlert: (state, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter(a => a.id !== action.payload);
    },
    setAlertSeverityFilter: (state, action: PayloadAction<string>) => {
      state.severityFilter = action.payload;
    }
  }
});

export const {
  addAlert,
  resolveAlert,
  dismissAlert,
  setAlertSeverityFilter
} = alertsSlice.actions;

export default alertsSlice.reducer;
