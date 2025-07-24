from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.api.v1 import applications, auth, staff
from app.core.security import get_current_user
from app.database import engine, Base
from app.config import settings
import uvicorn

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Leipzig Bürgerbüro API",
    description="Application tracking system for Leipzig Citizen Services",
    version="1.0.0",
    docs_url="/docs" ,
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Include API routers
app.include_router(
    applications.router,
    prefix="/api/v1/applications",
    tags=["applications"]
)

app.include_router(
    auth.router,
    prefix="/api/v1/auth",
    tags=["authentication"]
)

app.include_router(
    staff.router,
    prefix="/api/v1/staff",
    tags=["staff"],
    dependencies=[Depends(get_current_user)]
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Leipzig Bürgerbüro API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "leipzig-buergerbuero-api"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )