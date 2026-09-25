"""Pydantic schemas for Reports & Aggregated Analytics."""

from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    """Aggregated KPIs for Dashboard and Executive Reports."""

    total_farmers: int
    total_fields: int
    total_cultivated_acres: float
    total_seed_supplied_kg: float
    total_seed_allocated_kg: float
    remaining_seed_stock_kg: float
    expected_production_kg: float
    actual_production_kg: float
    average_ndvi: float
    active_crop_cycles: int
    completed_activities: int
    total_officer_visits: int


class VarietyYieldSummary(BaseModel):
    """Variety-wise acreage and yield comparison."""

    variety: str
    cultivated_acres: float
    expected_yield_maunds: float
    actual_yield_maunds: float
    avg_yield_per_acre: float


class ActivityCostSummary(BaseModel):
    """Operation category cost and volume breakdown."""

    activity_type: str
    total_operations: int
    total_cost: float
