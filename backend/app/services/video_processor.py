"""
Video Processing Service
Simplified version that works for YouTube embeds and demo purposes
"""
import re
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Video, VideoStatus
from ..config import get_settings

settings = get_settings()


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
    
    # For demo: use video ID as title, estimate duration
    # In production, you'd use YouTube Data API
    return {
        "title": f"YouTube Video - {video_id}",
        "duration": 300,  # Default 5 min estimate
        "youtube_id": video_id
    }


async def process_video_task(video_id: str, source: str, is_local: bool = False):
    """
    Simplified video processing task:
    1. For YouTube: Get basic info and create demo transcript
    2. For uploads: Use existing file path
    3. Create embeddings if transcript available
    """
    db = SessionLocal()
    
    try:
        # Update status to processing
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video:
            return
        
        video.status = VideoStatus.PROCESSING
        video.progress = 10
        db.commit()
        
        if not is_local:
            # YouTube video - get info and use demo transcript
            info = await get_youtube_info(source)
            video.title = info.get("title", "Untitled Video")
            video.duration = info.get("duration", 0)
            
            # Update progress
            video.progress = 30
            db.commit()
            
            # Demo transcript for YouTube videos
            # In production, you'd use Whisper API or YouTube captions
            video.transcript = generate_demo_transcript(video.title)
        else:
            # Local file - already have file path
            video.duration = 300  # Default duration
            if not video.transcript:
                video.transcript = generate_demo_transcript(video.title or "Uploaded Video")
        
        # Update progress
        video.progress = 60
        db.commit()
        
        # Create embeddings for RAG
        if video.transcript:
            await create_embeddings(video_id, video.transcript)
        
        # Update progress
        video.progress = 90
        db.commit()
        
        # Mark as completed
        video.status = VideoStatus.COMPLETED
        video.progress = 100
        db.commit()
        
        print(f"✅ Video {video_id} processed successfully!")
        
    except Exception as e:
        print(f"❌ Error processing video {video_id}: {e}")
        # Mark as failed
        video = db.query(Video).filter(Video.id == video_id).first()
        if video:
            video.status = VideoStatus.FAILED
            video.error_message = str(e)
            db.commit()
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
        print(f"✅ Embeddings created for video {video_id}")
    except Exception as e:
        print(f"⚠️ Could not create embeddings: {e}")
        # Don't fail the whole process if embeddings fail
