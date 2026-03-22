"""Vercel serverless entry point — mounts the FastAPI app under /api."""

import sys
import os
import shutil

# Add backend directory to Python path
_backend_dir = os.path.join(os.path.dirname(__file__), "..", "backend")
sys.path.insert(0, _backend_dir)

# Vercel has a read-only filesystem except /tmp
# Copy the SQLite database to /tmp so SQLAlchemy can use it
_src_db = os.path.join(_backend_dir, "ukproperty.db")
_tmp_db = "/tmp/ukproperty.db"

if os.path.exists(_src_db) and not os.path.exists(_tmp_db):
    shutil.copy2(_src_db, _tmp_db)

os.environ["DATABASE_URL"] = f"sqlite:///{_tmp_db}"

from app.main import app  # noqa: E402

# Vercel expects a variable called "app" or "handler"
handler = app
