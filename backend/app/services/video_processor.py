"""
Video Processing Service
Handles downloading, transcription, and embedding of videos
"""
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Video, VideoStatus
from ..config import get_settings

settings = get_settings()


async def process_video_task(video_id: str, source: str, is_local: bool = False):
    """
    Background task to process a video:
    1. Download (if URL) or use local file
    2. Extract audio
    3. Transcribe with Whisper
    4. Chunk and embed for RAG
    """
    db = SessionLocal()
    
    try:
        # Update status to processing
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video:
            return
        
        video.status = VideoStatus.PROCESSING
        db.commit()
        
        # Step 1: Get video file
        if not is_local:
            file_path = await download_video(source, video_id)
            video.file_path = file_path
        else:
            file_path = source
        
        # Step 2: Extract audio
        audio_path = await extract_audio(file_path)
        
        # Step 3: Transcribe
        transcript, duration = await transcribe_audio(audio_path)
        video.transcript = transcript
        video.duration = duration
        
        # Step 4: Get video title if from YouTube
        if not is_local and not video.title or video.title == "Processing...":
            video.title = await get_video_title(source)
        
        # Step 5: Create embeddings for RAG
        await create_embeddings(video_id, transcript)
        
        # Mark as completed
        video.status = VideoStatus.COMPLETED
        db.commit()
        
    except Exception as e:
        # Mark as failed
        video = db.query(Video).filter(Video.id == video_id).first()
        if video:
            video.status = VideoStatus.FAILED
            video.error_message = str(e)
            db.commit()
        raise
    finally:
        db.close()


async def download_video(url: str, video_id: str) -> str:
    """Download video from URL using yt-dlp"""
    import subprocess
    import os
    
    output_path = os.path.join(settings.upload_dir, f"{video_id}.mp4")
    
    # Use yt-dlp to download
    cmd = [
        "yt-dlp",
        "-f", "best[ext=mp4]/best",
        "-o", output_path,
        url
    ]
    
    process = subprocess.run(cmd, capture_output=True, text=True)
    if process.returncode != 0:
        raise Exception(f"Failed to download video: {process.stderr}")
    
    return output_path


async def extract_audio(video_path: str) -> str:
    """Extract audio from video using ffmpeg"""
    import subprocess
    import os
    
    audio_path = video_path.rsplit(".", 1)[0] + ".mp3"
    
    cmd = [
        "ffmpeg", "-i", video_path,
        "-vn", "-acodec", "libmp3lame",
        "-y", audio_path
    ]
    
    process = subprocess.run(cmd, capture_output=True, text=True)
    if process.returncode != 0:
        raise Exception(f"Failed to extract audio: {process.stderr}")
    
    return audio_path


async def transcribe_audio(audio_path: str) -> tuple[str, int]:
    """Transcribe audio using Whisper"""
    # Option 1: Use OpenAI Whisper API
    # Option 2: Use local Whisper model
    
    # For now, using OpenAI API
    import openai
    from ..config import get_settings
    
    settings = get_settings()
    
    if settings.openai_api_key:
        client = openai.OpenAI(api_key=settings.openai_api_key)
        
        with open(audio_path, "rb") as audio_file:
            result = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="verbose_json"
            )
        
        transcript = result.text
        duration = int(result.duration) if hasattr(result, 'duration') else 0
        
        return transcript, duration
    else:
        # Fallback: Use local whisper
        import whisper
        model = whisper.load_model("base")
        result = model.transcribe(audio_path)
        
        return result["text"], int(result.get("duration", 0))


async def get_video_title(url: str) -> str:
    """Get video title from URL"""
    import subprocess
    
    cmd = ["yt-dlp", "--get-title", url]
    process = subprocess.run(cmd, capture_output=True, text=True)
    
    if process.returncode == 0:
        return process.stdout.strip()
    return "Untitled Video"


async def create_embeddings(video_id: str, transcript: str):
    """Create vector embeddings for RAG"""
    from .rag_service import add_video_to_index
    await add_video_to_index(video_id, transcript)
