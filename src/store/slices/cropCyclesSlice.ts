import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CropCycle, CropCycleStage, CropHealthStatus } from '@/types';
import { MOCK_CROP_CYCLES } from '@/data/mockData';

interface CropCyclesState {
  cycles: CropCycle[];
  selectedCycleId: string | null;
  searchQuery: string;
  stageFilter: string;
  healthFilter: string;
}

const initialState: CropCyclesState = {
  cycles: MOCK_CROP_CYCLES,
  selectedCycleId: null,
  searchQuery: '',
  stageFilter: 'ALL',
  healthFilter: 'ALL'
};

export const cropCyclesSlice = createSlice({
  name: 'cropCycles',
  initialState,
  reducers: {
    addCycle: (state, action: PayloadAction<CropCycle>) => {
      state.cycles.unshift(action.payload);
    },
    updateCycle: (state, action: PayloadAction<CropCycle>) => {
      const index = state.cycles.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.cycles[index] = action.payload;
      }
    },
    updateCycleStage: (state, action: PayloadAction<{ id: string; stage: CropCycleStage }>) => {
      const cycle = state.cycles.find(c => c.id === action.payload.id);
      if (cycle) {
        cycle.currentStage = action.payload.stage;
      }
    },
    updateCycleHealth: (state, action: PayloadAction<{ id: string; health: CropHealthStatus }>) => {
      const cycle = state.cycles.find(c => c.id === action.payload.id);
      if (cycle) {
        cycle.healthStatus = action.payload.health;
      }
    },
    deleteCycle: (state, action: PayloadAction<string>) => {
      state.cycles = state.cycles.filter(c => c.id !== action.payload);
    },
    selectCycle: (state, action: PayloadAction<string | null>) => {
      state.selectedCycleId = action.payload;
    },
    setCycleSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setStageFilter: (state, action: PayloadAction<string>) => {
      state.stageFilter = action.payload;
    },
    setHealthFilter: (state, action: PayloadAction<string>) => {
      state.healthFilter = action.payload;
    }
  }
});

export const {
  addCycle,
  updateCycle,
  updateCycleStage,
  updateCycleHealth,
  deleteCycle,
  selectCycle,
  setCycleSearchQuery,
  setStageFilter,
  setHealthFilter
} = cropCyclesSlice.actions;

export default cropCyclesSlice.reducer;
