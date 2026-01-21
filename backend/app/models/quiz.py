from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from ..database import Base
import uuid


class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    video_id = Column(String(36), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False)
    questions = Column(JSON, nullable=False)  # Array of question objects
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def to_dict(self, include_answers=False):
        questions = self.questions or []
        if not include_answers:
            # Remove correct answer from response
            questions = [
                {k: v for k, v in q.items() if k != "correct_answer"}
                for q in questions
            ]
        
        return {
            "id": self.id,
            "video_id": self.video_id,
            "questions": questions,
            "question_count": len(questions),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    quiz_id = Column(String(36), ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    answers = Column(JSON, nullable=False)  # { questionId: selectedOption }
    score = Column(Integer, nullable=False)
    total = Column(Integer, nullable=False)
    time_taken = Column(Integer, nullable=True)  # seconds
    analysis = Column(Text, nullable=True)  # AI-generated feedback
    knowledge_gaps = Column(JSON, nullable=True)  # Topics to review
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "quiz_id": self.quiz_id,
            "answers": self.answers,
            "score": self.score,
            "total": self.total,
            "percentage": round((self.score / self.total) * 100, 1) if self.total > 0 else 0,
            "time_taken": self.time_taken,
            "analysis": self.analysis,
            "knowledge_gaps": self.knowledge_gaps,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
