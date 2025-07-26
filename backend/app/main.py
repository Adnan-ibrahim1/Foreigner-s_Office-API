from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from app.api.v1 import applications, auth, staff
from app.core.security import get_current_user
from app.database import engine, Base
from app.config import settings
import uvicorn
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Error creating database tables: {e}")

# Initialize FastAPI app
app = FastAPI(
    title="Leipzig Bürgerbüro API",
    description="Application tracking system for Leipzig Citizen Services",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )

# CORS middleware - with validation
try:
    cors_origins = settings.CORS_ORIGINS.split(",") if isinstance(settings.CORS_ORIGINS, str) else settings.CORS_ORIGINS
    logger.info(f"CORS origins: {cors_origins}")
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
except Exception as e:
    logger.error(f"Error setting up CORS: {e}")

# Security middleware - with validation
try:
    allowed_hosts = []
    for host in settings.ALLOWED_HOSTS:
        if host.startswith("http://"):
            allowed_hosts.append(host.replace("http://", ""))
        elif host.startswith("https://"):
            allowed_hosts.append(host.replace("https://", ""))
        else:
            allowed_hosts.append(host)
    
    # Add wildcard for development
    if settings.DEBUG:
        allowed_hosts.extend(["*"])
    
    logger.info(f"Allowed hosts: {allowed_hosts}")
    
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=allowed_hosts
    )
except Exception as e:
    logger.error(f"Error setting up TrustedHostMiddleware: {e}")

# Include API routers with error handling
try:
    app.include_router(
        applications.router,
        prefix="/api/v1/applications",
        tags=["applications"]
    )
    logger.info("Applications router included")
except Exception as e:
    logger.error(f"Error including applications router: {e}")

try:
    app.include_router(
        auth.router,
        prefix="/api/v1/auth",
        tags=["authentication"]
    )
    logger.info("Auth router included")
except Exception as e:
    logger.error(f"Error including auth router: {e}")

try:
    app.include_router(
        staff.router,
        prefix="/api/v1/staff",
        tags=["staff"],
        dependencies=[Depends(get_current_user)]
    )
    logger.info("Staff router included")
except Exception as e:
    logger.error(f"Error including staff router: {e}")

@app.get("/")
async def root():
    """Root endpoint"""
    logger.info("Root endpoint accessed")
    return {
        "message": "Leipzig Bürgerbüro API",
        "version": "1.0.0",
        "docs": "/docs",
        "environment": settings.ENVIRONMENT
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    logger.info("Health check endpoint accessed")
    return {
        "status": "healthy",
        "service": "leipzig-buergerbuero-api",
        "environment": settings.ENVIRONMENT,
        "debug": settings.DEBUG
    }

@app.get("/debug/config")
async def debug_config():
    """Debug endpoint to check configuration (only in development)"""
    if not settings.DEBUG:
        return {"error": "Debug endpoint only available in development mode"}
    
    return {
        "cors_origins": settings.CORS_ORIGINS,
        "allowed_hosts": settings.ALLOWED_HOSTS,
        "environment": settings.ENVIRONMENT,
        "debug": settings.DEBUG
    }

if __name__ == "__main__":
    logger.info("Starting server...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )