from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Index
from sqlalchemy.sql import func
from ..database import Base
import uuid


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    __table_args__ = (
        Index('idx_chat_video_id', 'video_id'),
        Index('idx_chat_video_created', 'video_id', 'created_at'),
    )
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    video_id = Column(String(36), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    references = Column(JSON, nullable=True)
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
