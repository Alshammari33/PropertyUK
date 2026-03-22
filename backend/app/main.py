"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import engine, Base
from app.routes import properties, recommend

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PropertyUK API",
    description="AI-enhanced UK property search, comparison and recommendation system",
    version="1.0.0",
)

# CORS – allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}


# Register routers
app.include_router(properties.router)
app.include_router(recommend.router)
