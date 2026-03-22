"""Vercel serverless entry point — debug version."""

import os
import sys
import json

# Minimal ASGI app to debug the environment
async def app(scope, receive, send):
    if scope["type"] == "http":
        # Gather debug info
        backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend")
        backend_dir = os.path.abspath(backend_dir)

        info = {
            "cwd": os.getcwd(),
            "file": os.path.abspath(__file__),
            "backend_dir": backend_dir,
            "backend_exists": os.path.isdir(backend_dir),
            "parent_contents": [],
            "backend_contents": [],
        }

        parent = os.path.dirname(os.path.abspath(__file__))
        parent2 = os.path.dirname(parent)
        info["parent"] = parent
        info["parent2"] = parent2

        try:
            info["parent_contents"] = os.listdir(parent)
        except Exception as e:
            info["parent_contents_error"] = str(e)

        try:
            info["parent2_contents"] = os.listdir(parent2)
        except Exception as e:
            info["parent2_contents_error"] = str(e)

        if os.path.isdir(backend_dir):
            try:
                info["backend_contents"] = os.listdir(backend_dir)
            except Exception as e:
                info["backend_contents_error"] = str(e)

        body = json.dumps(info, indent=2).encode()

        await send({
            "type": "http.response.start",
            "status": 200,
            "headers": [[b"content-type", b"application/json"]],
        })
        await send({
            "type": "http.response.body",
            "body": body,
        })

handler = app
