# Generic router module for the Databricks app template
# Add your FastAPI routes here

from fastapi import APIRouter

from .user import router as user_router
from .upload import router as upload_router

router = APIRouter()
router.include_router(user_router, prefix='/user', tags=['user'])
router.include_router(upload_router, tags=['upload'])
