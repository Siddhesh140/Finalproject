from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Any
from datetime import datetime


# ============================================
# VIDEO SCHEMAS
# ============================================

class VideoProcessUrl(BaseModel):
    url: str
    title: Optional[str] = None


class VideoUploadResponse(BaseModel):
    id: str
    title: str
    status: str
    message: str


class VideoResponse(BaseModel):
    id: str
    title: str
    source_type: str
    source_url: Optional[str] = None
    file_path: Optional[str] = None
    duration: Optional[int] = None
    thumbnail_url: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class VideoStatusResponse(BaseModel):
    id: str
    status: str
    progress: Optional[int] = None
    message: Optional[str] = None


# ============================================
# CHAT SCHEMAS
# ============================================

class ChatMessageRequest(BaseModel):
    videoId: str
    message: str


class ChatReference(BaseModel):
    start: int  # Start timestamp in seconds
    end: int    # End timestamp in seconds
    text: str   # Relevant text


class ChatMessageResponse(BaseModel):
    message: str
    references: Optional[List[ChatReference]] = None


class ChatHistoryResponse(BaseModel):
    video_id: str
    messages: List[dict]


# ============================================
# QUIZ SCHEMAS
# ============================================

class QuizGenerateRequest(BaseModel):
    videoId: str
    questionCount: int = 10


class QuizOption(BaseModel):
    id: str
    text: str


class QuizQuestion(BaseModel):
    id: str
    question: str
    options: List[QuizOption]
    # correct_answer is stored but not exposed to frontend


class QuizResponse(BaseModel):
    id: str
    video_id: str
    questions: List[QuizQuestion]
    question_count: int
    created_at: Optional[datetime] = None


class QuizSubmitRequest(BaseModel):
    answers: dict  # { questionId: selectedOptionId }


class QuizResultResponse(BaseModel):
    id: str
    quiz_id: str
    score: int
    total: int
    percentage: float
    analysis: Optional[str] = None
    knowledge_gaps: Optional[List[str]] = None


# ============================================
# SEARCH SCHEMAS
# ============================================

class SearchRequest(BaseModel):
    query: str
    video_id: Optional[str] = None
    limit: int = 10


class SearchResult(BaseModel):
    video_id: str
    video_title: str
    text: str
    timestamp_start: int
    timestamp_end: int
    relevance_score: float


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total: int
