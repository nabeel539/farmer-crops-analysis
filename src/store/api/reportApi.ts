import { baseApi } from './baseApi';

export interface DashboardSummaryData {
  total_farmers: number;
  total_fields: number;
  total_cultivated_acres: number;
  total_seed_supplied_kg: number;
  total_seed_allocated_kg: number;
  remaining_seed_stock_kg: number;
  expected_production_kg: number;
  actual_production_kg: number;
  average_ndvi: number;
  active_crop_cycles: number;
  completed_activities: number;
  total_officer_visits: number;
}

export interface VarietyYieldItem {
  variety: string;
  cultivated_acres: number;
  expected_yield_maunds: number;
  actual_yield_maunds: number;
  avg_yield_per_acre: number;
}

export interface ActivityCostItem {
  activity_type: string;
  total_operations: number;
  total_cost: number;
}

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummaryData, void>({
      query: () => '/reports/summary',
      providesTags: [{ type: 'Report', id: 'DASHBOARD_SUMMARY' }],
    }),
    getVarietyPerformance: builder.query<VarietyYieldItem[], void>({
      query: () => '/reports/variety-performance',
      providesTags: [{ type: 'Report', id: 'VARIETY_PERFORMANCE' }],
    }),
    getActivityCosts: builder.query<ActivityCostItem[], void>({
      query: () => '/reports/activity-costs',
      providesTags: [{ type: 'Report', id: 'ACTIVITY_COSTS' }],
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetVarietyPerformanceQuery,
  useGetActivityCostsQuery,
} = reportApi;
