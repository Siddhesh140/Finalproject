from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import engine, Base
from .routers import videos_router, chat_router, quiz_router, search_router

# Create database tables
Base.metadata.create_all(bind=engine)

# Get settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="Backend API for Video-RAG application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware - allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(videos_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(quiz_router, prefix="/api")
app.include_router(search_router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "Video-RAG API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
