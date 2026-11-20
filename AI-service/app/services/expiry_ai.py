from app.schemas import (
    BatchExpiryInput,
    ExpiryBatchResult,
    ExpiryInsightRequest,
    ExpiryInsightResponse,
    RiskLevel,
    TransferSuggestion,
)


def _classify_expiry_risk(days_left: int, waste_units: float) -> RiskLevel:
    if days_left <= 14 or (days_left <= 30 and waste_units > 0):
        return "High"
    if days_left <= 30:
        return "Medium"
    return "Low"


def analyze_expiry_and_transfers(
    request: ExpiryInsightRequest,
) -> ExpiryInsightResponse:
    batch_results: list[ExpiryBatchResult] = []
    at_risk_batches: list[BatchExpiryInput] = []

    for batch in request.batches:
        days_left = (batch.expiry_date - request.as_of_date).days
        effective_days = max(days_left, 0)
        projected_usage = round(batch.avg_daily_usage * effective_days, 1)
        waste_units = round(max(0.0, batch.quantity - projected_usage), 1)
        risk = _classify_expiry_risk(days_left, waste_units)

        if days_left <= request.near_expiry_window_days:
            at_risk_batches.append(batch)

        if days_left < 0:
            action = "Quarantine expired batch immediately and log on blockchain"
        elif waste_units > 0 and days_left <= request.near_expiry_window_days:
            action = "Prioritize FEFO dispensing or transfer surplus units to a higher-demand clinic"
        elif days_left <= request.near_expiry_window_days:
            action = "Dispense first (FEFO) and monitor daily usage"
        else:
            action = "Normal stock monitoring"

        batch_results.append(
            ExpiryBatchResult(
                batch_code=batch.batch_code,
                medicine_name=batch.medicine_name,
                clinic_name=batch.clinic_name,
                days_until_expiry=days_left,
                projected_usage_before_expiry=projected_usage,
                estimated_waste_units=waste_units,
                expiry_risk=risk,
                recommended_action=action,
            )
        )

    # Suggest transfers when a near-expiry batch has excess units and another clinic faces stockout risk
    suggestions: list[TransferSuggestion] = []
    for donor in at_risk_batches:
        days_left = (donor.expiry_date - request.as_of_date).days
        if days_left <= 0:
            continue
        projected_usage = donor.avg_daily_usage * days_left
        surplus = int(max(0, donor.quantity - projected_usage))
        if surplus < 10:
            continue

        for key, days_to_stockout in request.clinic_stockout_risks.items():
            if ":" not in key:
                continue
            target_clinic_id, target_med_id = key.split(":", 1)
            if (
                target_med_id == donor.medicine_id
                and target_clinic_id != donor.clinic_id
                and days_to_stockout <= 10
            ):
                transfer_qty = max(1, min(surplus, int(donor.avg_daily_usage * 7) or 20))
                suggestions.append(
                    TransferSuggestion(
                        batch_code=donor.batch_code,
                        medicine_name=donor.medicine_name,
                        from_clinic=donor.clinic_name,
                        to_clinic=f"Clinic ({target_clinic_id})",
                        suggested_units=transfer_qty,
                        reason=(
                            f"Batch expires in {days_left} days with surplus stock while target clinic "
                            f"may stock out in {days_to_stockout} days."
                        ),
                    )
                )
                break

    near_expiry_count = sum(
        1 for b in batch_results if b.days_until_expiry <= request.near_expiry_window_days
    )

    return ExpiryInsightResponse(
        near_expiry_count=near_expiry_count,
        batches=batch_results,
        transfer_suggestions=suggestions,
    )