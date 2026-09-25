"""Krishi AgriTech — FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import (
    activities,
    allocations,
    auth,
    crop_cycles,
    farmers,
    fields,
    harvests,
    reports,
    seeds,
    vendors,
    visits,
)
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="Farmer & Crop Management System — Backend API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API v1 routers
API_PREFIX = "/api/v1"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(vendors.router, prefix=API_PREFIX)
app.include_router(seeds.router, prefix=API_PREFIX)
app.include_router(farmers.router, prefix=API_PREFIX)
app.include_router(fields.router, prefix=API_PREFIX)
app.include_router(allocations.router, prefix=API_PREFIX)
app.include_router(crop_cycles.router, prefix=API_PREFIX)
app.include_router(activities.router, prefix=API_PREFIX)
app.include_router(visits.router, prefix=API_PREFIX)
app.include_router(harvests.router, prefix=API_PREFIX)
app.include_router(reports.router, prefix=API_PREFIX)


@app.get("/", tags=["Health"])
def root() -> dict:
    """Health check endpoint."""
    return {"status": "ok", "app": settings.APP_NAME, "version": "0.1.0"}


@app.get("/health", tags=["Health"])
def health_check() -> dict:
    """Detailed health check."""
    return {"status": "healthy", "database": "postgresql", "environment": settings.APP_ENV}
