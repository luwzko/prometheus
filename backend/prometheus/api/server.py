from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from prometheus.api.routers.basic_router import router as api_router
from prometheus.api.routers.config_router import config_router

app = FastAPI(title = "Prometheus API")

app.add_middleware(
    middleware_class = CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix = "/api")
app.include_router(config_router, prefix = "/api")