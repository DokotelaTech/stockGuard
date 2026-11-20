from pathlib import Path
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split

SERVICE_ROOT = Path(__file__).resolve().parent.parent


def main() -> None:
    data_path = SERVICE_ROOT / "training" / "data" / "clinic_dispensing.csv"
    if not data_path.exists():
        raise FileNotFoundError(
            "Run 'python -m training.generate_sample_data' first or place real CSV data there."
        )

    df = pd.read_csv(data_path).sort_values(["clinic_id", "medicine_id", "date"])
    grouped = df.groupby(["clinic_id", "medicine_id"])["units_dispensed"]

    df["recent_7d_avg"] = grouped.transform(
        lambda s: s.rolling(7, min_periods=1).mean().shift(1).fillna(0)
    )
    df["recent_30d_avg"] = grouped.transform(
        lambda s: s.rolling(30, min_periods=1).mean().shift(1).fillna(0)
    )

    feature_cols = [
        "current_stock",
        "recent_7d_avg",
        "recent_30d_avg",
        "day_of_week",
        "month",
    ]
    X = df[feature_cols]
    y = df["units_dispensed"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, shuffle=False
    )

    model = RandomForestRegressor(n_estimators=120, random_state=42)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)

    artifact_dir = SERVICE_ROOT / "training" / "artifacts"
    artifact_dir.mkdir(parents=True, exist_ok=True)
    out_file = artifact_dir / "demand_forecaster.joblib"
    joblib.dump(model, out_file)

    print(f"Saved model to {out_file} | Test MAE: {mae:.2f} units/day")


if __name__ == "__main__":
    main()
