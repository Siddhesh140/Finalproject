from pydantic_settings import BaseSettings
from functools import lru_cache
import os
import logging

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    app_name: str = "Video-RAG API"
    debug: bool = True
    
    database_url: str = "sqlite:///./videorag.db"
    chroma_persist_dir: str = "./chroma_db"
    
    openai_api_key: str = ""
    google_api_key: str = ""
    
    jwt_secret: str = "your-super-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 60 * 24 * 7
    
    llm_provider: str = "google"
    
    upload_dir: str = "./uploads"
    max_file_size: int = 500 * 1024 * 1024
    
    redis_url: str = "redis://localhost:6379"
    
    class Config:
        env_file = ".env"
        extra = "ignore"


def _is_valid_api_key(key: str) -> bool:
    """Check if API key is valid (not placeholder)"""
    return bool(key and not key.startswith("your-"))


def validate_api_keys():
    """Validate API keys at startup and log warnings"""
    google_valid = _is_valid_api_key(settings.google_api_key)
    openai_valid = _is_valid_api_key(settings.openai_api_key)
    
    if google_valid:
        logger.info("Google API key configured (Gemini will be used)")
    elif openai_valid:
        logger.info("OpenAI API key configured (GPT will be used)")
    else:
        logger.warning(
            "No valid AI API key found. Please set GOOGLE_API_KEY or OPENAI_API_KEY in .env"
        )


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
os.makedirs(settings.upload_dir, exist_ok=True)
os.makedirs(settings.chroma_persist_dir, exist_ok=True)
validate_api_keys()
