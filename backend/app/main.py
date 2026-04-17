from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1 import api_router
from app.config import get_settings
from app.database import Base, engine
from app.models import MenuItem, POI, Tour, User

settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
app.mount('/static', StaticFiles(directory=settings.upload_dir), name='static')

app.include_router(api_router, prefix=settings.api_prefix)


@app.on_event('startup')
def startup_event():
    # Baseline for MVP. Replace with Alembic migrations in production.
    Base.metadata.create_all(bind=engine)
