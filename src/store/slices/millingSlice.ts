import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MillingBatch } from '@/types';
import { MOCK_MILLING_BATCHES } from '@/data/mockData';

interface MillingState {
  batches: MillingBatch[];
  selectedBatchId: string | null;
  searchQuery: string;
  statusFilter: string;
}

const initialState: MillingState = {
  batches: MOCK_MILLING_BATCHES,
  selectedBatchId: null,
  searchQuery: '',
  statusFilter: 'ALL'
};

export const millingSlice = createSlice({
  name: 'milling',
  initialState,
  reducers: {
    addBatch: (state, action: PayloadAction<MillingBatch>) => {
      state.batches.unshift(action.payload);
    },
    updateBatch: (state, action: PayloadAction<MillingBatch>) => {
      const index = state.batches.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.batches[index] = action.payload;
      }
    },
    deleteBatch: (state, action: PayloadAction<string>) => {
      state.batches = state.batches.filter(b => b.id !== action.payload);
    },
    selectBatch: (state, action: PayloadAction<string | null>) => {
      state.selectedBatchId = action.payload;
    },
    setBatchSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setBatchStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    }
  }
});

export const {
  addBatch,
  updateBatch,
  deleteBatch,
  selectBatch,
  setBatchSearchQuery,
  setBatchStatusFilter
} = millingSlice.actions;

export default millingSlice.reducer;
