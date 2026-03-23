"""Vercel serverless entry point.

Uses BaseHTTPRequestHandler (Vercel's native Python format) and
forwards requests to the FastAPI app via its TestClient.
"""

import os
import sys
import shutil
import json
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, urlencode

# --- Bootstrap the backend ---
_parent = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_backend_dir = os.path.join(_parent, "backend")
sys.path.insert(0, _backend_dir)

# Copy SQLite DB to /tmp (Vercel's writable area)
_src_db = os.path.join(_backend_dir, "ukproperty.db")
_tmp_db = "/tmp/ukproperty.db"
if os.path.exists(_src_db) and not os.path.exists(_tmp_db):
    shutil.copy2(_src_db, _tmp_db)
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp_db}"

# Import FastAPI app and create a test client for internal forwarding
from app.main import app as fastapi_app  # noqa: E402
from starlette.testclient import TestClient  # noqa: E402

_client = TestClient(fastapi_app, raise_server_exceptions=False)


class handler(BaseHTTPRequestHandler):
    def _forward(self, method: str):
        """Forward the incoming request to the FastAPI app."""
        parsed = urlparse(self.path)
        path = parsed.path
        query = f"?{parsed.query}" if parsed.query else ""
        url = f"{path}{query}"

        # Read body if present
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length) if content_length > 0 else None

        # Forward to FastAPI via TestClient
        headers = {}
        if self.headers.get("Content-Type"):
            headers["Content-Type"] = self.headers["Content-Type"]

        if method == "GET":
            resp = _client.get(url, headers=headers)
        elif method == "POST":
            resp = _client.post(url, content=body, headers=headers)
        elif method == "PUT":
            resp = _client.put(url, content=body, headers=headers)
        elif method == "DELETE":
            resp = _client.delete(url, headers=headers)
        elif method == "OPTIONS":
            resp = _client.options(url, headers=headers)
        else:
            resp = _client.get(url, headers=headers)

        # Send response back
        self.send_response(resp.status_code)
        for key, value in resp.headers.items():
            if key.lower() not in ("transfer-encoding", "content-encoding", "content-length"):
                self.send_header(key, value)
        self.send_header("Content-Length", str(len(resp.content)))
        # CORS headers for Vercel
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(resp.content)

    def do_GET(self):
        self._forward("GET")

    def do_POST(self):
        self._forward("POST")

    def do_PUT(self):
        self._forward("PUT")

    def do_DELETE(self):
        self._forward("DELETE")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
