"""Vercel serverless entry point — mounts the FastAPI app under /api."""

import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

# Override DATABASE_URL to use bundled SQLite
_db_path = os.path.join(os.path.dirname(__file__), "..", "backend", "ukproperty.db")
os.environ.setdefault("DATABASE_URL", f"sqlite:///{_db_path}")

from app.main import app  # noqa: E402

# Vercel expects a variable called "app" or "handler"
handler = app
