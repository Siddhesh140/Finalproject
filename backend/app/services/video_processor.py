"""
Video Processing Service
Simplified version that works for YouTube embeds and demo purposes
"""
import re
import asyncio
import logging
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Video, VideoStatus
from ..config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

TASK_TIMEOUT_SECONDS = 300


def extract_youtube_id(url: str) -> str:
    """Extract YouTube video ID from URL"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^"&?\/\s]{11})',
        r'youtube\.com\/shorts\/([^"&?\/\s]{11})',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


async def get_youtube_info(url: str) -> dict:
    """Get basic info from YouTube URL (simplified)"""
    video_id = extract_youtube_id(url)
    if not video_id:
        return {"title": "Unknown Video", "duration": 0}
    
    return {
        "title": f"YouTube Video - {video_id}",
        "duration": 300,
        "youtube_id": video_id
    }


def _update_video_status(db: Session, video: Video, status: VideoStatus, progress: int, 
                         title: str = None, duration: int = None, transcript: str = None,
                         error_message: str = None):
    """Batch update video fields and commit"""
    if status:
        video.status = status
    if progress is not None:
        video.progress = progress
    if title is not None:
        video.title = title
    if duration is not None:
        video.duration = duration
    if transcript is not None:
        video.transcript = transcript
    if error_message is not None:
        video.error_message = error_message
    db.commit()


async def process_video_task(video_id: str, source: str, is_local: bool = False):
    """
    Simplified video processing task:
    1. For YouTube: Get basic info and create demo transcript
    2. For uploads: Use existing file path
    3. Create embeddings if transcript available
    """
    try:
        async with asyncio.timeout(TASK_TIMEOUT_SECONDS):
            await _process_video_internal(video_id, source, is_local)
    except asyncio.TimeoutError:
        logger.error("Video %s processing timed out after %ds", video_id, TASK_TIMEOUT_SECONDS)
        _mark_video_failed(video_id, "Processing timed out")
    except Exception as e:
        logger.error("Error processing video %s: %s", video_id, str(e))
        _mark_video_failed(video_id, str(e))


async def _process_video_internal(video_id: str, source: str, is_local: bool = False):
    """Internal processing logic with batched commits"""
    db = SessionLocal()
    
    try:
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video:
            logger.warning("Video %s not found for processing", video_id)
            return
        
        _update_video_status(db, video, VideoStatus.PROCESSING, 10)
        logger.info("Started processing video %s", video_id)
        
        transcript = None
        if not is_local:
            info = await get_youtube_info(source)
            _update_video_status(db, video, None, 30, 
                                  title=info.get("title", "Untitled Video"),
                                  duration=info.get("duration", 0))
            transcript = generate_demo_transcript(video.title)
        else:
            _update_video_status(db, video, None, 30, duration=300)
            if not video.transcript:
                transcript = generate_demo_transcript(video.title or "Uploaded Video")
        
        if transcript:
            _update_video_status(db, video, None, 60, transcript=transcript)
            
            try:
                await create_embeddings(video_id, transcript)
            except Exception as e:
                logger.warning("Embedding creation failed for video %s: %s", video_id, str(e))
        
        _update_video_status(db, video, VideoStatus.COMPLETED, 100)
        logger.info("Video %s processed successfully", video_id)
        
    finally:
        db.close()


def _mark_video_failed(video_id: str, error_message: str):
    """Mark video as failed"""
    db = SessionLocal()
    try:
        video = db.query(Video).filter(Video.id == video_id).first()
        if video:
            video.status = VideoStatus.FAILED
            video.error_message = error_message
            db.commit()
            logger.error("Video %s marked as failed: %s", video_id, error_message)
    finally:
        db.close()


def generate_demo_transcript(title: str) -> str:
    """Generate a demo transcript for testing purposes"""
    return f"""
Welcome to this video about {title}.

In this session, we'll be covering several important topics related to {title}.

First, let's start with the fundamentals. Understanding the basics is crucial 
before we dive into more advanced concepts.

The key concepts we'll explore include:
- Introduction and overview of the subject matter
- Core principles and foundational knowledge
- Practical applications and real-world examples
- Best practices and common patterns
- Tips for further learning and improvement

As we progress through this video, you'll gain a comprehensive understanding 
of {title} and how it applies to various scenarios.

Remember to take notes on the important points we discuss. 
Feel free to pause and rewind if you need to review any section.

By the end of this video, you should be able to:
- Understand the core concepts of {title}
- Apply this knowledge to practical situations
- Continue learning and building upon these foundations

Let's dive in and explore {title} together!

This video covers approximately 5-10 minutes of content on {title}, 
designed to give you a solid foundation for further exploration.

Thank you for watching!
"""


async def create_embeddings(video_id: str, transcript: str):
    """Create vector embeddings for RAG"""
    try:
        from .rag_service import add_video_to_index
        await add_video_to_index(video_id, transcript)
        logger.info("Embeddings created for video %s", video_id)
    except Exception as e:
        logger.warning("Could not create embeddings for video %s: %s", video_id, str(e))
