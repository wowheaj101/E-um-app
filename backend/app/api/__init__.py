"""/api/v1 라우터 집합."""
from fastapi import APIRouter

from .assets import router as assets_router
from .auth import router as auth_router
from .fds import router as fds_router
from .helpers import router as helpers_router
from .legacy import router as legacy_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(assets_router)
api_router.include_router(helpers_router)
api_router.include_router(fds_router)
api_router.include_router(legacy_router)
