from pathlib import Path
import joblib
import numpy as np


class ModelStore:
    def __init__(self, model_path: str) -> None:
        self.model_path = Path(model_path)
        self.model = None
        self.loaded = False

    def load(self) -> None:
        self.model = None
        self.loaded = False
        if not self.model_path.exists():
            return

        try:
            self.model = joblib.load(self.model_path)
            self.loaded = True
        except Exception as error:
            # Keep the API available with its moving-average fallback when an
            # artifact is absent, incomplete, or incompatible.
            print(f"Unable to load forecasting model at {self.model_path}: {error}")

    def predict_daily_demand(
        self,
        current_stock: float,
        recent_7d_avg: float,
        recent_30d_avg: float,
        day_of_week: int,
        month: int,
    ) -> float:
        # Fallback if no trained model artifact is present or the artifact is
        # incompatible with the current feature schema.
        if self.loaded and self.model is not None:
            features = np.array(
                [[current_stock, recent_7d_avg, recent_30d_avg, day_of_week, month]],
                dtype=float,
            )
            try:
                pred = float(self.model.predict(features)[0])
                return round(max(0.0, pred), 2)
            except Exception as error:
                print(f"Forecast model prediction failed; using usage average: {error}")

        if recent_7d_avg > 0 and recent_30d_avg > 0:
            blended = 0.65 * recent_7d_avg + 0.35 * recent_30d_avg
        else:
            blended = max(recent_7d_avg, recent_30d_avg, 0.0)
        return round(max(0.0, blended), 2)
