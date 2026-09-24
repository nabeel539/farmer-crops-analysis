import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Farmer } from '@/types';
import { MOCK_FARMERS } from '@/data/mockData';

interface FarmersState {
  farmers: Farmer[];
  selectedFarmerId: string | null;
  searchQuery: string;
  statusFilter: string;
  districtFilter: string;
  loading: boolean;
  error: string | null;
}

const initialState: FarmersState = {
  farmers: MOCK_FARMERS,
  selectedFarmerId: null,
  searchQuery: '',
  statusFilter: 'ALL',
  districtFilter: 'ALL',
  loading: false,
  error: null
};

export const farmersSlice = createSlice({
  name: 'farmers',
  initialState,
  reducers: {
    setFarmers: (state, action: PayloadAction<Farmer[]>) => {
      state.farmers = action.payload;
    },
    addFarmer: (state, action: PayloadAction<Farmer>) => {
      state.farmers.unshift(action.payload);
    },
    updateFarmer: (state, action: PayloadAction<Farmer>) => {
      const index = state.farmers.findIndex(f => f.id === action.payload.id);
      if (index !== -1) {
        state.farmers[index] = action.payload;
      }
    },
    deleteFarmer: (state, action: PayloadAction<string>) => {
      state.farmers = state.farmers.filter(f => f.id !== action.payload);
    },
    selectFarmer: (state, action: PayloadAction<string | null>) => {
      state.selectedFarmerId = action.payload;
    },
    setFarmerSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFarmerStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
    setFarmerDistrictFilter: (state, action: PayloadAction<string>) => {
      state.districtFilter = action.payload;
    }
  }
});

export const {
  setFarmers,
  addFarmer,
  updateFarmer,
  deleteFarmer,
  selectFarmer,
  setFarmerSearchQuery,
  setFarmerStatusFilter,
  setFarmerDistrictFilter
} = farmersSlice.actions;

export default farmersSlice.reducer;
