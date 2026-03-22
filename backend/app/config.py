"""Application configuration loaded from environment variables."""

import os
from pydantic_settings import BaseSettings

_DEFAULT_DB = "sqlite:///" + os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ukproperty.db"
)


class Settings(BaseSettings):
    DATABASE_URL: str = _DEFAULT_DB

    class Config:
        env_file = ".env"


settings = Settings()
