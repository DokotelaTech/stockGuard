from datetime import date
from typing import Literal
from pydantic import BaseModel, Field


RiskLevel = Literal["Low", "Medium", "High"]


class UsagePoint(BaseModel):
    date: date
    units_dispensed: float = Field(..., ge=0)


class StockItemInput(BaseModel):
    medicine_id: str
    medicine_name: str
    clinic_id: str
    clinic_name: str
    current_stock: float = Field(..., ge=0)
    average_daily_usage: float | None = Field(default=None, ge=0)
    lead_time_days: int | None = Field(default=None, ge=1, le=60)
    history: list[UsagePoint] = Field(default_factory=list)


class ForecastRequest(BaseModel):
    horizon_days: int = Field(default=14, ge=1, le=90)
    items: list[StockItemInput] = Field(..., min_length=1)


class ForecastItemResult(BaseModel):
    medicine_id: str
    medicine_name: str
    clinic_id: str
    clinic_name: str
    current_stock: float
    predicted_daily_demand: float
    predicted_horizon_demand: float
    days_until_stockout: float | None
    recommended_level: float
    stockout_risk: RiskLevel
    headline: str


class ForecastResponse(BaseModel):
    horizon_days: int
    high_risk_count: int
    headline_alert: str | None
    results: list[ForecastItemResult]


class BatchExpiryInput(BaseModel):
    batch_code: str
    medicine_id: str
    medicine_name: str
    clinic_id: str
    clinic_name: str
    quantity: float = Field(..., ge=0)
    expiry_date: date
    avg_daily_usage: float = Field(..., ge=0)


class ExpiryInsightRequest(BaseModel):
    as_of_date: date = Field(default_factory=date.today)
    near_expiry_window_days: int = Field(default=30, ge=1, le=180)
    batches: list[BatchExpiryInput] = Field(..., min_length=1)
    clinic_stockout_risks: dict[str, float] = Field(
        default_factory=dict,
        description="Optional map of 'clinic_id:medicine_id' -> days_until_stockout",
    )


class TransferSuggestion(BaseModel):
    batch_code: str
    medicine_name: str
    from_clinic: str
    to_clinic: str
    suggested_units: int = Field(..., ge=1)
    reason: str


class ExpiryBatchResult(BaseModel):
    batch_code: str
    medicine_name: str
    clinic_name: str
    days_until_expiry: int
    projected_usage_before_expiry: float
    estimated_waste_units: float
    expiry_risk: RiskLevel
    recommended_action: str


class ExpiryInsightResponse(BaseModel):
    near_expiry_count: int
    batches: list[ExpiryBatchResult]
    transfer_suggestions: list[TransferSuggestion]
