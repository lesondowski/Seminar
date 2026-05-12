from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers.admin import router as admin_router
from app.routers.bootstrap import router as bootstrap_router
from app.routers.chat import router as chat_router
from app.routers.health import router as health_router
from app.routers.monitor import router as monitor_router
from app.routers.visitor_auth import router as visitor_auth_router

app = FastAPI(title=settings.app_name, debug=settings.app_debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_base_url, "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(visitor_auth_router)
app.include_router(bootstrap_router)
app.include_router(chat_router)
app.include_router(admin_router)
app.include_router(monitor_router)


@app.get("/")
def root():
    return {"success": True, "data": {"service": settings.app_name}, "error": None}
