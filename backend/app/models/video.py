from sqlalchemy import Column, String, Integer, Text, DateTime, Enum
from sqlalchemy.sql import func
from ..database import Base
import uuid
import enum


class VideoStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class VideoSource(str, enum.Enum):
    YOUTUBE = "youtube"
    UPLOAD = "upload"


class Video(Base):
    __tablename__ = "videos"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    source_type = Column(String(20), default=VideoSource.UPLOAD)
    source_url = Column(Text, nullable=True)
    file_path = Column(Text, nullable=True)
    duration = Column(Integer, nullable=True)  # seconds
    thumbnail_url = Column(Text, nullable=True)
    status = Column(String(20), default=VideoStatus.PENDING)
    transcript = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "source_type": self.source_type,
            "source_url": self.source_url,
            "file_path": self.file_path,
            "duration": self.duration,
            "thumbnail_url": self.thumbnail_url,
            "status": self.status,
            "transcript": self.transcript,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
