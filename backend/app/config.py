from pydantic_settings import BaseSettings
from typing import List, ClassVar
import os

class Settings(BaseSettings):
    # Application settings
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./leipzig_buergerbuero.db")
    
    # Security settings
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1", "leipzig.de"]
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Email settings
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "noreply@leipzig.de")
    
    # SMS settings (optional)
    SMS_API_KEY: str = os.getenv("SMS_API_KEY", "")
    SMS_API_URL: str = os.getenv("SMS_API_URL", "")
    
    # Processing time estimates (in days)
    PROCESSING_TIMES: ClassVar[dict[str, int]] = {
        "anmeldung": 3,
        "passport": 14,
        "visa_extension": 21,
        "work_permit": 28,
        "residence_permit": 35,
    }
    
    # Supported languages
    SUPPORTED_LANGUAGES: List[str] = ["de", "en", "ar", "fr", "es"]
    
    # File upload settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: List[str] = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"]
    UPLOAD_DIR: str = "uploads/"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create global settings instance
settings = Settings()