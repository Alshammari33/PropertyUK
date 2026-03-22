"""Vercel serverless entry point — mounts the FastAPI app under /api."""

import sys
import os
import shutil
import traceback

# Add backend directory to Python path
_backend_dir = os.path.join(os.path.dirname(__file__), "..", "backend")
_backend_dir = os.path.abspath(_backend_dir)
sys.path.insert(0, _backend_dir)

# Debug: list files to verify backend is included
_debug_info = {
    "backend_dir": _backend_dir,
    "backend_exists": os.path.isdir(_backend_dir),
    "cwd": os.getcwd(),
    "dir_contents": [],
}

try:
    if os.path.isdir(_backend_dir):
        _debug_info["dir_contents"] = os.listdir(_backend_dir)
except Exception:
    pass

# Vercel has a read-only filesystem except /tmp
# Copy the SQLite database to /tmp so SQLAlchemy can use it
_src_db = os.path.join(_backend_dir, "ukproperty.db")
_tmp_db = "/tmp/ukproperty.db"

_debug_info["src_db"] = _src_db
_debug_info["src_db_exists"] = os.path.exists(_src_db)

if os.path.exists(_src_db) and not os.path.exists(_tmp_db):
    shutil.copy2(_src_db, _tmp_db)

_debug_info["tmp_db_exists"] = os.path.exists(_tmp_db)

os.environ["DATABASE_URL"] = f"sqlite:///{_tmp_db}"

try:
    from app.main import app  # noqa: E402
    handler = app
except Exception as e:
    # If import fails, create a minimal app that returns the error
    from fastapi import FastAPI
    app = FastAPI()
    _import_error = traceback.format_exc()

    @app.get("/{path:path}")
    def debug_error(path: str = ""):
        return {
            "error": str(e),
            "traceback": _import_error,
            "debug": _debug_info,
        }

    handler = app
