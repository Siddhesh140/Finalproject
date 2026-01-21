from .videos import router as videos_router
from .chat import router as chat_router
from .quiz import router as quiz_router
from .search import router as search_router
from .notes import router as notes_router

__all__ = [
    "videos_router",
    "chat_router", 
    "quiz_router",
    "search_router",
    "notes_router",
]

