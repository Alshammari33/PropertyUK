from http.server import BaseHTTPRequestHandler
import json
import os


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        me = os.path.abspath(__file__)
        my_dir = os.path.dirname(me)
        parent = os.path.dirname(my_dir)

        info = {
            "file": me,
            "my_dir": my_dir,
            "parent": parent,
            "my_dir_contents": os.listdir(my_dir),
            "parent_contents": os.listdir(parent) if os.path.isdir(parent) else "N/A",
        }

        backend_dir = os.path.join(parent, "backend")
        info["backend_dir"] = backend_dir
        info["backend_exists"] = os.path.isdir(backend_dir)
        if os.path.isdir(backend_dir):
            info["backend_contents"] = os.listdir(backend_dir)

        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(info, indent=2).encode())
