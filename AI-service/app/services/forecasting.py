from datetime import date
import numpy as np
from app.config import settings
from app.schemas import (
    ForecastItemResult,
    ForecastRequest,
    ForecastResponse,
    RiskLevel,
    StockItemInput,
)
from app.services.model_store import ModelStore


def _classify_stockout_risk(days_left: float | None) -> RiskLevel:
    if days_left is None:
        return "Low"
    if days_left <= settings.high_risk_days_threshold:
        return "High"
    if days_left <= settings.medium_risk_days_threshold:
        return "Medium"
    return "Low"


def _compute_usage_averages(item: StockItemInput) -> tuple[float, float]:
    if not item.history:
        daily_usage = float(item.average_daily_usage or 0.0)
        return daily_usage, daily_usage

    ordered = sorted(item.history, key=lambda x: x.date)
    values = [p.units_dispensed for p in ordered]
    avg_30d = float(np.mean(values[-30:])) if values else 0.0
    avg_7d = float(np.mean(values[-7:])) if values else avg_30d
    return avg_7d, avg_30d


def run_forecast(request: ForecastRequest, model_store: ModelStore) -> ForecastResponse:
    today = date.today()
    results: list[ForecastItemResult] = []
    urgent_candidates: list[ForecastItemResult] = []

    for item in request.items:
        avg_7d, avg_30d = _compute_usage_averages(item)
        daily_demand = model_store.predict_daily_demand(
            current_stock=item.current_stock,
            recent_7d_avg=avg_7d,
            recent_30d_avg=avg_30d,
            day_of_week=today.weekday(),
            month=today.month,
        )

        horizon_demand = round(daily_demand * request.horizon_days, 1)
        lead_time = item.lead_time_days or settings.default_lead_time_days
        recommended_level = round(
            daily_demand * (lead_time + settings.safety_buffer_days), 1
        )

        if daily_demand > 0:
            days_left: float | None = round(item.current_stock / daily_demand, 1)
        else:
            days_left = None

        risk = _classify_stockout_risk(days_left)

        if days_left is not None and risk in ("High", "Medium"):
            rounded_days = max(1, int(round(days_left)))
            headline = f"{item.clinic_name} may run out of {item.medicine_name} in {rounded_days} days"
        elif daily_demand == 0:
            headline = f"No recent dispensing recorded for {item.medicine_name} at {item.clinic_name}"
        else:
            headline = f"{item.medicine_name} stock at {item.clinic_name} is healthy"

        entry = ForecastItemResult(
            medicine_id=item.medicine_id,
            medicine_name=item.medicine_name,
            clinic_id=item.clinic_id,
            clinic_name=item.clinic_name,
            current_stock=item.current_stock,
            predicted_daily_demand=daily_demand,
            predicted_horizon_demand=horizon_demand,
            days_until_stockout=days_left,
            recommended_level=recommended_level,
            stockout_risk=risk,
            headline=headline,
        )
        results.append(entry)

        if risk == "High" and days_left is not None:
            urgent_candidates.append(entry)

    urgent_candidates.sort(key=lambda x: x.days_until_stockout or 9999)
    headline_alert = urgent_candidates[0].headline if urgent_candidates else None
    high_risk_count = sum(1 for r in results if r.stockout_risk == "High")

    return ForecastResponse(
        horizon_days=request.horizon_days,
        high_risk_count=high_risk_count,
        headline_alert=headline_alert,
        results=results,
    )
