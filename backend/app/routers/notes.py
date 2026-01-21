from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from ..database import get_db
from ..models import Note, Video

router = APIRouter(prefix="/videos", tags=["Notes"])


# Pydantic schemas
class NoteCreate(BaseModel):
    content: str
    timestamp: int | None = None


class NoteResponse(BaseModel):
    id: str
    video_id: str
    content: str
    timestamp: int | None
    created_at: str | None


# ============================================
# Notes Endpoints
# ============================================

@router.get("/{video_id}/notes", response_model=List[NoteResponse])
def get_notes(video_id: str, db: Session = Depends(get_db)):
    """Get all notes for a video"""
    # Verify video exists
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    notes = db.query(Note).filter(Note.video_id == video_id).order_by(Note.timestamp.asc()).all()
    return [NoteResponse(**n.to_dict()) for n in notes]


@router.post("/{video_id}/notes", response_model=NoteResponse)
def create_note(video_id: str, data: NoteCreate, db: Session = Depends(get_db)):
    """Create a note for a video"""
    # Verify video exists
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    note = Note(
        video_id=video_id,
        content=data.content,
        timestamp=data.timestamp
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    
    return NoteResponse(**note.to_dict())


@router.delete("/{video_id}/notes/{note_id}")
def delete_note(video_id: str, note_id: str, db: Session = Depends(get_db)):
    """Delete a note"""
    note = db.query(Note).filter(Note.id == note_id, Note.video_id == video_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(note)
    db.commit()
    
    return {"message": "Note deleted successfully"}
