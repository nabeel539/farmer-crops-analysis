import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SeedDistributionRecord, SeedBag } from '@/types';
import { MOCK_SEED_DISTRIBUTIONS, MOCK_SEED_BAGS } from '@/data/mockData';

interface SeedDistributionState {
  distributions: SeedDistributionRecord[];
  seedBags: SeedBag[];
  selectedDistributionId: string | null;
  searchQuery: string;
  varietyFilter: string;
  paymentStatusFilter: string;
}

const initialState: SeedDistributionState = {
  distributions: MOCK_SEED_DISTRIBUTIONS,
  seedBags: MOCK_SEED_BAGS,
  selectedDistributionId: null,
  searchQuery: '',
  varietyFilter: 'ALL',
  paymentStatusFilter: 'ALL'
};

export const seedDistributionsSlice = createSlice({
  name: 'seedDistributions',
  initialState,
  reducers: {
    addDistribution: (state, action: PayloadAction<SeedDistributionRecord>) => {
      state.distributions.unshift(action.payload);
    },
    updateDistribution: (state, action: PayloadAction<SeedDistributionRecord>) => {
      const index = state.distributions.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.distributions[index] = action.payload;
      }
    },
    deleteDistribution: (state, action: PayloadAction<string>) => {
      state.distributions = state.distributions.filter(d => d.id !== action.payload);
    },
    selectDistribution: (state, action: PayloadAction<string | null>) => {
      state.selectedDistributionId = action.payload;
    },
    setDistributionSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setDistributionVarietyFilter: (state, action: PayloadAction<string>) => {
      state.varietyFilter = action.payload;
    },
    setDistributionPaymentFilter: (state, action: PayloadAction<string>) => {
      state.paymentStatusFilter = action.payload;
    }
  }
});

export const {
  addDistribution,
  updateDistribution,
  deleteDistribution,
  selectDistribution,
  setDistributionSearchQuery,
  setDistributionVarietyFilter,
  setDistributionPaymentFilter
} = seedDistributionsSlice.actions;

export default seedDistributionsSlice.reducer;
