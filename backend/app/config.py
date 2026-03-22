"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://qa@localhost:5432/ukproperty"

    class Config:
        env_file = ".env"


settings = Settings()
