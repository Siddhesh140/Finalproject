from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import SearchRequest, SearchResponse
from ..services.rag_service import search_videos

router = APIRouter(prefix="/search", tags=["Search"])


@router.post("", response_model=SearchResponse)
async def search(
    data: SearchRequest,
    db: Session = Depends(get_db)
):
    """Search across all videos using semantic search"""
    results = await search_videos(
        query=data.query,
        video_id=data.video_id,
        limit=data.limit,
        db=db
    )
    
    return SearchResponse(
        query=data.query,
        results=results,
        total=len(results)
    )


@router.get("/suggestions")
async def get_suggestions(q: str):
    """Get search suggestions (autocomplete)"""
    # For now, return empty - can be enhanced with popular searches
    return {"suggestions": []}
