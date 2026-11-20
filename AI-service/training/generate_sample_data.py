from datetime import date, timedelta
from pathlib import Path
import numpy as np
import pandas as pd

SERVICE_ROOT = Path(__file__).resolve().parent.parent


def main() -> None:
    rng = np.random.default_rng(42)
    out_dir = SERVICE_ROOT / "training" / "data"
    out_dir.mkdir(parents=True, exist_ok=True)

    start_date = date.today() - timedelta(days=90)
    clinics = [
        ("CLN-A", "Clinic A - Johannesburg", 45.0),
        ("CLN-B", "Clinic B", 65.0),
    ]
    medicines = [
        ("MED-AMOX", "Amoxicillin 500mg", 1.2),
        ("MED-METF", "Metformin 850mg", 1.0),
        ("MED-PARA", "Paracetamol 500mg", 1.4),
    ]

    rows: list[dict[str, object]] = []
    for day_idx in range(90):
        current_day = start_date + timedelta(days=day_idx)
        for clinic_id, clinic_name, base_stock in clinics:
            for med_id, med_name, mult in medicines:
                weekend_factor = 0.75 if current_day.weekday() >= 5 else 1.05
                daily_usage = max(
                    1.0,
                    rng.normal(loc=18.0 * mult * weekend_factor, scale=4.0),
                )
                stock = max(0.0, base_stock + rng.normal(0, 15))
                rows.append(
                    {
                        "date": current_day.isoformat(),
                        "clinic_id": clinic_id,
                        "clinic_name": clinic_name,
                        "medicine_id": med_id,
                        "medicine_name": med_name,
                        "current_stock": round(stock, 1),
                        "units_dispensed": round(daily_usage, 1),
                        "day_of_week": current_day.weekday(),
                        "month": current_day.month,
                    }
                )

    df = pd.DataFrame(rows)
    csv_path = out_dir / "clinic_dispensing.csv"
    df.to_csv(csv_path, index=False)
    print(f"Wrote {len(df)} sample rows to {csv_path}")


if __name__ == "__main__":
    main()
