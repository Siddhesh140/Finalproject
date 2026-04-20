"""
Unit tests for SQLAlchemy models
"""
import pytest
from datetime import datetime
from app.models import User, Video, ChatMessage, Quiz, Note, VideoStatus, VideoSource


class TestUserModel:
    """Tests for User model"""
    
    def test_user_to_dict(self, db_session):
        """User to_dict returns correct data"""
        user = User(
            name="Test User",
            email="test@example.com",
            phone="1234567890",
            password_hash="hash"
        )
        db_session.add(user)
        db_session.commit()
        
        data = user.to_dict()
        assert data["name"] == "Test User"
        assert data["email"] == "test@example.com"
        assert data["phone"] == "1234567890"
    
    def test_user_default_active(self, db_session):
        """User is_active defaults to True"""
        user = User(name="Test", email="test@example.com", password_hash="hash")
        db_session.add(user)
        db_session.commit()
        
        assert user.is_active is True


class TestVideoModel:
    """Tests for Video model"""
    
    def test_video_to_dict(self, db_session):
        """Video to_dict returns correct data"""
        video = Video(
            title="Test Video",
            source_type=VideoSource.YOUTUBE,
            source_url="https://youtu.be/test",
            status=VideoStatus.COMPLETED,
            duration=300
        )
        db_session.add(video)
        db_session.commit()
        
        data = video.to_dict()
        assert data["title"] == "Test Video"
        assert data["source_type"] == "youtube"
        assert data["duration"] == 300
    
    def test_video_default_status(self, db_session):
        """Video status defaults to pending"""
        video = Video(title="Test", source_url="https://test.com")
        db_session.add(video)
        db_session.commit()
        
        assert video.status == VideoStatus.PENDING


class TestChatMessageModel:
    """Tests for ChatMessage model"""
    
    def test_chat_message_creation(self, db_session):
        """ChatMessage stores correct data"""
        video = Video(id="video-123", title="Test")
        msg = ChatMessage(
            video_id="video-123",
            role="user",
            content="Hello"
        )
        db_session.add_all([video, msg])
        db_session.commit()
        
        assert msg.video_id == "video-123"
        assert msg.role == "user"
        assert msg.content == "Hello"


class TestNoteModel:
    """Tests for Note model"""
    
    def test_note_creation(self, db_session):
        """Note stores correct data"""
        video = Video(id="video-123", title="Test")
        note = Note(
            video_id="video-123",
            content="Test note",
            timestamp=60.0
        )
        db_session.add_all([video, note])
        db_session.commit()
        
        assert note.video_id == "video-123"
        assert note.content == "Test note"
        assert note.timestamp == 60.0