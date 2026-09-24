import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HarvestRecord } from '@/types';
import { MOCK_HARVESTS } from '@/data/mockData';

interface HarvestsState {
  harvests: HarvestRecord[];
  selectedHarvestId: string | null;
  searchQuery: string;
  gradeFilter: string;
  statusFilter: string;
}

const initialState: HarvestsState = {
  harvests: MOCK_HARVESTS,
  selectedHarvestId: null,
  searchQuery: '',
  gradeFilter: 'ALL',
  statusFilter: 'ALL'
};

export const harvestsSlice = createSlice({
  name: 'harvests',
  initialState,
  reducers: {
    addHarvest: (state, action: PayloadAction<HarvestRecord>) => {
      state.harvests.unshift(action.payload);
    },
    updateHarvest: (state, action: PayloadAction<HarvestRecord>) => {
      const index = state.harvests.findIndex(h => h.id === action.payload.id);
      if (index !== -1) {
        state.harvests[index] = action.payload;
      }
    },
    deleteHarvest: (state, action: PayloadAction<string>) => {
      state.harvests = state.harvests.filter(h => h.id !== action.payload);
    },
    selectHarvest: (state, action: PayloadAction<string | null>) => {
      state.selectedHarvestId = action.payload;
    },
    setHarvestSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setHarvestGradeFilter: (state, action: PayloadAction<string>) => {
      state.gradeFilter = action.payload;
    },
    setHarvestStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    }
  }
});

export const {
  addHarvest,
  updateHarvest,
  deleteHarvest,
  selectHarvest,
  setHarvestSearchQuery,
  setHarvestGradeFilter,
  setHarvestStatusFilter
} = harvestsSlice.actions;

export default harvestsSlice.reducer;
