from http.server import BaseHTTPRequestHandler
import json
import os
import sys
import traceback


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parent = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        backend_dir = os.path.join(parent, "backend")
        sys.path.insert(0, backend_dir)

        info = {"steps": []}

        # Step 1: Try importing FastAPI
        try:
            import fastapi
            info["steps"].append(f"fastapi OK: {fastapi.__version__}")
        except Exception as e:
            info["steps"].append(f"fastapi FAIL: {e}")
            info["traceback"] = traceback.format_exc()

        # Step 2: Try importing pydantic_settings
        try:
            import pydantic_settings
            info["steps"].append(f"pydantic_settings OK")
        except Exception as e:
            info["steps"].append(f"pydantic_settings FAIL: {e}")
            info["traceback"] = traceback.format_exc()

        # Step 3: Try importing app config
        try:
            os.environ["DATABASE_URL"] = "sqlite:////tmp/ukproperty.db"
            from app.config import settings
            info["steps"].append(f"app.config OK: {settings.DATABASE_URL}")
        except Exception as e:
            info["steps"].append(f"app.config FAIL: {e}")
            info["traceback"] = traceback.format_exc()

        # Step 4: Copy DB
        try:
            import shutil
            src = os.path.join(backend_dir, "ukproperty.db")
            dst = "/tmp/ukproperty.db"
            if os.path.exists(src):
                shutil.copy2(src, dst)
                info["steps"].append(f"DB copy OK: {os.path.getsize(dst)} bytes")
            else:
                info["steps"].append(f"DB not found at {src}")
        except Exception as e:
            info["steps"].append(f"DB copy FAIL: {e}")

        # Step 5: Try importing app.main
        try:
            from app.main import app as fastapi_app
            info["steps"].append("app.main OK")
            info["routes"] = [r.path for r in fastapi_app.routes]
        except Exception as e:
            info["steps"].append(f"app.main FAIL: {e}")
            info["traceback"] = traceback.format_exc()

        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(info, indent=2).encode())
