import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Indian E-Commerce & AI/ML API Security Platform"
    VERSION: str = "2.0.0"
    API_V1_PREFIX: str = "/api"
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = "sqlite:///./api_security.db"

    # JWT Authentication
    JWT_SECRET: str = "super-secret-production-grade-random-key-change-me-32chars"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"

    # Payment & UPI Configuration (Indian Rupee INR)
    CURRENCY: str = "INR"
    CURRENCY_SYMBOL: str = "₹"
    UPI_ID: str = "aadityabhardwaj5398@oksbi"
    PAYMENT_MODE: str = "demo"  # 'demo' or 'sandbox' or 'live'
    PAYMENT_PROVIDER: str = "UPI_GATEWAY"
    PAYMENT_KEY_ID: str = ""
    PAYMENT_KEY_SECRET: str = ""

    # LLM Settings (OpenAI / Compatible)
    LLM_API_KEY: str = ""
    LLM_API_BASE: str = "https://api.openai.com/v1"
    LLM_MODEL: str = "gpt-4o-mini"

    # Risk Engine Thresholds (0.0 to 1.0)
    RISK_THRESHOLD_MEDIUM: float = 0.40
    RISK_THRESHOLD_HIGH: float = 0.70
    RISK_THRESHOLD_CRITICAL: float = 0.88

    # ML & GNN Settings
    ISOLATION_FOREST_CONTAMINATION: float = 0.08
    GNN_HIDDEN_DIM: int = 32
    GNN_EMBEDDING_DIM: int = 16

    @property
    def cors_origin_list(self) -> List[str]:
        if not self.CORS_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
