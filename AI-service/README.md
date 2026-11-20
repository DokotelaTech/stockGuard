# StockGuard AI service

This FastAPI service provides demand forecasts and expiry/transfer insights to the StockGuard frontend.

## Run locally

From this directory:

```bash
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
cp env.example .env        # Windows: copy env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

Check `http://localhost:8001/health`. The frontend uses `VITE_AI_API_URL`, which defaults to `http://localhost:8001`.

## Forecast data

Forecasts use a trained model when `training/artifacts/demand_forecaster.joblib` exists. Without it, the service remains available and uses a recent-usage average fallback. The frontend sends usage history when present and each medicine's optional **Average daily usage** value otherwise. Add a realistic average daily usage in inventory for useful recommendations; a medicine with no recorded usage is reported with zero predicted demand.

To train an initial model using generated demonstration data:

```bash
python -m training.generate_sample_data
python -m training.train_model
```

The generated dataset is synthetic and is only for trying the model pipeline. Replace it with appropriate dispensing history before using its predictions for operational decisions. Historical CSV data must include `date`, `clinic_id`, `medicine_id`, `current_stock`, `units_dispensed`, `day_of_week`, and `month`.

## Configuration

Copy `env.example` to `.env` and adjust the service port, model path, risk thresholds, and `CORS_ORIGINS` as needed. Keep CORS origins limited to the frontend hosts you use.
