from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from prometheus.api.routes import router as api_router

app = FastAPI(title = "Prometheus API")

app.add_middleware(
    middleware_class = CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(api_router, prefix="/api")