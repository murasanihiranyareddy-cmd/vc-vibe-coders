from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "VC (Vibe Coders)"
    APP_ENV: str = Field(default="development", env="APP_ENV")
    DEBUG: bool = True
    DEMO_MODE: bool = Field(default=True, env="DEMO_MODE")
    
    # Hindsight Cloud Settings
    HINDSIGHT_BASE_URL: str = Field(
        default="https://api.hindsight.vectorize.io",
        env="HINDSIGHT_BASE_URL"
    )
    HINDSIGHT_API_KEY: Optional[str] = Field(default=None, env="HINDSIGHT_API_KEY")
    HINDSIGHT_BANK_ID: Optional[str] = Field(default=None, env="HINDSIGHT_BANK_ID")
    
    # Groq Settings
    GROQ_API_KEY: Optional[str] = Field(default=None, env="GROQ_API_KEY")
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    
    # Supabase Settings
    SUPABASE_URL: Optional[str] = Field(default=None, env="SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = Field(default=None, env="SUPABASE_SERVICE_ROLE_KEY")
    SUPABASE_ANON_KEY: Optional[str] = Field(default=None, env="SUPABASE_ANON_KEY")
    
    # Firebase Settings
    FIREBASE_PROJECT_ID: Optional[str] = Field(default=None, env="FIREBASE_PROJECT_ID")
    FIREBASE_CLIENT_EMAIL: Optional[str] = Field(default=None, env="FIREBASE_CLIENT_EMAIL")
    FIREBASE_PRIVATE_KEY: Optional[str] = Field(default=None, env="FIREBASE_PRIVATE_KEY")
    
    # CORS
    CORS_ORIGINS: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        env="CORS_ORIGINS"
    )

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_hindsight_configured(self) -> bool:
        return bool(self.HINDSIGHT_API_KEY and self.HINDSIGHT_BANK_ID and len(self.HINDSIGHT_API_KEY.strip()) > 5)

    @property
    def is_groq_configured(self) -> bool:
        return bool(self.GROQ_API_KEY and len(self.GROQ_API_KEY.strip()) > 5)

    @property
    def is_supabase_configured(self) -> bool:
        return bool(self.SUPABASE_URL and (self.SUPABASE_SERVICE_ROLE_KEY or self.SUPABASE_ANON_KEY))

    @property
    def is_firebase_configured(self) -> bool:
        return bool(self.FIREBASE_PROJECT_ID and self.FIREBASE_CLIENT_EMAIL and self.FIREBASE_PRIVATE_KEY)

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
