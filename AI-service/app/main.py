from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.schemas import (
    ExpiryInsightRequest,
    ExpiryInsightResponse,
    ForecastRequest,
    ForecastResponse,
)
from app.services.expiry_ai import analyze_expiry_and_transfers
from app.services.forecasting import run_forecast
from app.services.model_store import ModelStore

model_store = ModelStore(settings.resolved_model_path)


@asynccontextmanager
async def lifespan(_: FastAPI):
    model_store.load()
    yield


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> dict[str, object]:
    return {
        "status": "ok",
        "service": settings.app_name,
        "model_loaded": model_store.loaded,
    }


@app.post("/api/v1/ai/forecast", response_model=ForecastResponse)
def forecast_endpoint(payload: ForecastRequest) -> ForecastResponse:
    return run_forecast(payload, model_store)


@app.post("/api/v1/ai/expiry-insights", response_model=ExpiryInsightResponse)
def expiry_endpoint(payload: ExpiryInsightRequest) -> ExpiryInsightResponse:
    return analyze_expiry_and_transfers(payload)
