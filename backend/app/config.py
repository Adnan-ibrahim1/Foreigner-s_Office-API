# app/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List


class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: Optional[str] = None
    
    # JWT settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # App settings
    APP_NAME: str = "Leipzig Bürgerbüro System"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True  # Set to True for development, False for production
    
    # CORS settings
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"
    
    # SMTP settings
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # File upload settings
    ALLOWED_EXTENSIONS: str = "pdf,jpg,jpeg,png,doc,docx"
    ALLOWED_HOSTS: List[str] = ["http://localhost", "http://127.0.0.1", "http://localhost:8000"]
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # Configure the settings
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"  # This allows extra environment variables to be ignored
    )


# Create settings instance
settings = Settings()