from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from ..database import Base
import uuid


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    video_id = Column(String(36), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    references = Column(JSON, nullable=True)  # Video timestamp references
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "video_id": self.video_id,
            "role": self.role,
            "content": self.content,
            "references": self.references,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
