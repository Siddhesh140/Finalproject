from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from ..database import Base
import uuid


class Note(Base):
    __tablename__ = "notes"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    video_id = Column(String(36), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(Integer, nullable=True)  # Video timestamp in seconds
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "video_id": self.video_id,
            "content": self.content,
            "timestamp": self.timestamp,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
