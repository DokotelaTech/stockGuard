from pathlib import Path
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve paths relative to the ai-service/ root directory so commands work
# regardless of which folder the developer runs uvicorn or training scripts from.
SERVICE_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    # Service metadata & server bindinga
    app_name: str = "StockGuard AI Service"
    environment: str = Field(default="development", description="development | staging | production")
    host: str = "0.0.0.0"
    port: int = Field(default=8001, ge=1024, le=65535)
    log_level: str = "info"

    # CORS origins for frontend / backend integration (comma-separated in .env)
    cors_origins: list[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8000",
        ]
    )

    # Trained ML model artifact path
    model_path: str = "training/artifacts/demand_forecaster.joblib"

    # Inventory & forecasting tuning parameters
    default_horizon_days: int = Field(default=14, ge=1, le=90)
    default_lead_time_days: int = Field(default=5, ge=1, le=60)
    safety_buffer_days: int = Field(default=4, ge=0, le=30)

    # Stockout risk day thresholds (matches dashboard Stockout Risks & AI Forecast)
    high_risk_days_threshold: int = Field(default=7, ge=1)
    medium_risk_days_threshold: int = Field(default=14, ge=1)

    # Expiry & inter-clinic transfer thresholds
    near_expiry_window_days: int = Field(default=30, ge=1, le=180)
    transfer_target_stockout_days: int = Field(default=10, ge=1, le=60)
    min_transfer_surplus_units: int = Field(default=10, ge=1)

    # Optional internal API key if your backend wants basic service-to-service auth
    ai_api_key: str | None = None

    model_config = SettingsConfigDict(
        env_file=SERVICE_ROOT / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("medium_risk_days_threshold")
    @classmethod
    def validate_risk_thresholds(cls, value: int, info) -> int:
        high_threshold = info.data.get("high_risk_days_threshold", 7)
        if value < high_threshold:
            raise ValueError(
                "medium_risk_days_threshold must be greater than or equal to high_risk_days_threshold"
            )
        return value

    @property
    def resolved_model_path(self) -> Path:
        path = Path(self.model_path)
        if path.is_absolute():
            return path
        return (SERVICE_ROOT / path).resolve()


settings = Settings()