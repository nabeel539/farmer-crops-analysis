import { configureStore } from '@reduxjs/toolkit';
import farmersReducer from './slices/farmersSlice';
import seedDistributionsReducer from './slices/seedDistributionsSlice';
import landParcelsReducer from './slices/landParcelsSlice';
import cropCyclesReducer from './slices/cropCyclesSlice';
import activitiesReducer from './slices/activitiesSlice';
import harvestsReducer from './slices/harvestsSlice';
import millingReducer from './slices/millingSlice';
import alertsReducer from './slices/alertsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    farmers: farmersReducer,
    seedDistributions: seedDistributionsReducer,
    landParcels: landParcelsReducer,
    cropCycles: cropCyclesReducer,
    activities: activitiesReducer,
    harvests: harvestsReducer,
    milling: millingReducer,
    alerts: alertsReducer,
    ui: uiReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
