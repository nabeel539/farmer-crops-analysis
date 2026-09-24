import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FieldActivity, ActivityType } from '@/types';
import { MOCK_ACTIVITIES } from '@/data/mockData';

interface ActivitiesState {
  activities: FieldActivity[];
  selectedActivityId: string | null;
  searchQuery: string;
  typeFilter: string;
  statusFilter: string;
}

const initialState: ActivitiesState = {
  activities: MOCK_ACTIVITIES,
  selectedActivityId: null,
  searchQuery: '',
  typeFilter: 'ALL',
  statusFilter: 'ALL'
};

export const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    addActivity: (state, action: PayloadAction<FieldActivity>) => {
      state.activities.unshift(action.payload);
    },
    updateActivity: (state, action: PayloadAction<FieldActivity>) => {
      const index = state.activities.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.activities[index] = action.payload;
      }
    },
    completeActivity: (state, action: PayloadAction<{ id: string; executedDate: string; notes?: string }>) => {
      const activity = state.activities.find(a => a.id === action.payload.id);
      if (activity) {
        activity.status = 'COMPLETED';
        activity.executedDate = action.payload.executedDate;
        if (action.payload.notes) {
          activity.notes = action.payload.notes;
        }
      }
    },
    deleteActivity: (state, action: PayloadAction<string>) => {
      state.activities = state.activities.filter(a => a.id !== action.payload);
    },
    selectActivity: (state, action: PayloadAction<string | null>) => {
      state.selectedActivityId = action.payload;
    },
    setActivitySearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setActivityTypeFilter: (state, action: PayloadAction<string>) => {
      state.typeFilter = action.payload;
    },
    setActivityStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    }
  }
});

export const {
  addActivity,
  updateActivity,
  completeActivity,
  deleteActivity,
  selectActivity,
  setActivitySearchQuery,
  setActivityTypeFilter,
  setActivityStatusFilter
} = activitiesSlice.actions;

export default activitiesSlice.reducer;
