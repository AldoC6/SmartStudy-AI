"""Minimal placeholder FastAPI backend.

This frontend project consumes an external NestJS API at REACT_APP_API_URL
(default http://localhost:3000/api). This placeholder only exists to keep
the supervisor 'backend' program running and to provide a /api/health
endpoint inside the preview container.
"""
from fastapi import FastAPI

app = FastAPI(title="SmartStudy AI - placeholder")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "smartstudy-frontend-placeholder"}


@app.get("/api/")
def root():
    return {
        "message": "Frontend-only project. Real API is the NestJS backend.",
    }
