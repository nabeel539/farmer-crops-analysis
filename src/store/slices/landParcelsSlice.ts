import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LandParcel } from '@/types';
import { MOCK_LAND_PARCELS } from '@/data/mockData';

interface LandParcelsState {
  parcels: LandParcel[];
  selectedParcelId: string | null;
  searchQuery: string;
  soilTypeFilter: string;
  irrigationFilter: string;
}

const initialState: LandParcelsState = {
  parcels: MOCK_LAND_PARCELS,
  selectedParcelId: null,
  searchQuery: '',
  soilTypeFilter: 'ALL',
  irrigationFilter: 'ALL'
};

export const landParcelsSlice = createSlice({
  name: 'landParcels',
  initialState,
  reducers: {
    addParcel: (state, action: PayloadAction<LandParcel>) => {
      state.parcels.unshift(action.payload);
    },
    updateParcel: (state, action: PayloadAction<LandParcel>) => {
      const index = state.parcels.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.parcels[index] = action.payload;
      }
    },
    deleteParcel: (state, action: PayloadAction<string>) => {
      state.parcels = state.parcels.filter(p => p.id !== action.payload);
    },
    selectParcel: (state, action: PayloadAction<string | null>) => {
      state.selectedParcelId = action.payload;
    },
    setParcelSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSoilTypeFilter: (state, action: PayloadAction<string>) => {
      state.soilTypeFilter = action.payload;
    },
    setIrrigationFilter: (state, action: PayloadAction<string>) => {
      state.irrigationFilter = action.payload;
    }
  }
});

export const {
  addParcel,
  updateParcel,
  deleteParcel,
  selectParcel,
  setParcelSearchQuery,
  setSoilTypeFilter,
  setIrrigationFilter
} = landParcelsSlice.actions;

export default landParcelsSlice.reducer;
