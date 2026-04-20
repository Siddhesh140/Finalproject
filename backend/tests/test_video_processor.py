"""
Tests for Video Processor Service
"""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from app.services.video_processor import (
    extract_youtube_id,
    generate_demo_transcript,
    process_video_task,
    _mark_video_failed,
    TASK_TIMEOUT_SECONDS,
)
from app.models import VideoStatus


class TestExtractYoutubeId:
    """Tests for YouTube ID extraction"""

    def test_standard_youtube_url(self):
        """Test standard youtube.com/watch?v= URL"""
        url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        assert extract_youtube_id(url) == "dQw4w9WgXcQ"

    def test_short_youtube_url(self):
        """Test youtu.be short URL"""
        url = "https://youtu.be/dQw4w9WgXcQ"
        assert extract_youtube_id(url) == "dQw4w9WgXcQ"

    def test_youtube_embed_url(self):
        """Test youtube.com/embed/ URL"""
        url = "https://www.youtube.com/embed/dQw4w9WgXcQ"
        assert extract_youtube_id(url) == "dQw4w9WgXcQ"

    def test_youtube_shorts_url(self):
        """Test youtube.com/shorts/ URL"""
        url = "https://www.youtube.com/shorts/dQw4w9WgXcQ"
        assert extract_youtube_id(url) == "dQw4w9WgXcQ"

    def test_invalid_url(self):
        """Test invalid URL returns None"""
        url = "https://example.com/video"
        assert extract_youtube_id(url) is None

    def test_empty_url(self):
        """Test empty URL returns None"""
        assert extract_youtube_id("") is None

    def test_url_with_extra_params(self):
        """Test URL with additional parameters"""
        url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf"
        assert extract_youtube_id(url) == "dQw4w9WgXcQ"


class TestGenerateDemoTranscript:
    """Tests for demo transcript generation"""

    def test_generates_transcript(self):
        """Test that transcript is generated"""
        title = "Test Video"
        transcript = generate_demo_transcript(title)
        assert isinstance(transcript, str)
        assert len(transcript) > 0

    def test_title_in_transcript(self):
        """Test that title appears in transcript"""
        title = "Python Basics"
        transcript = generate_demo_transcript(title)
        assert title in transcript

    def test_contains_key_topics(self):
        """Test transcript contains expected sections"""
        transcript = generate_demo_transcript("Test")
        assert "fundamentals" in transcript.lower() or "basics" in transcript.lower()
        assert "key concepts" in transcript.lower()


class TestChunkTextRAG:
    """Tests for text chunking in RAG service"""

    def test_chunks_text_correctly(self):
        """Test text is split into chunks"""
        from app.services.rag_service import chunk_text
        text = " ".join([f"word{i}" for i in range(100)])
        chunks = chunk_text(text, chunk_size=10, overlap=2)
        assert len(chunks) > 1
        assert all("text" in c for c in chunks)

    def test_chunk_has_metadata(self):
        """Test each chunk has required metadata"""
        from app.services.rag_service import chunk_text
        text = " ".join([f"word{i}" for i in range(50)])
        chunks = chunk_text(text)
        chunk = chunks[0]
        assert "text" in chunk
        assert "start" in chunk
        assert "end" in chunk
        assert "index" in chunk

    def test_overlap_preserved(self):
        """Test that overlap between chunks is preserved"""
        from app.services.rag_service import chunk_text
        text = " ".join([f"word{i}" for i in range(30)])
        chunks = chunk_text(text, chunk_size=10, overlap=5)
        if len(chunks) >= 2:
            assert chunks[0]["text"] != chunks[1]["text"]

    def test_empty_text(self):
        """Test empty text returns empty list"""
        from app.services.rag_service import chunk_text
        chunks = chunk_text("")
        assert chunks == []

    def test_small_text(self):
        """Test text smaller than chunk size"""
        from app.services.rag_service import chunk_text
        text = "small text"
        chunks = chunk_text(text, chunk_size=500)
        assert len(chunks) == 1

    def test_timestamps_estimated(self):
        """Test timestamps are reasonable"""
        from app.services.rag_service import chunk_text
        text = " ".join([f"word{i}" for i in range(100)])
        chunks = chunk_text(text)
        for chunk in chunks:
            assert chunk["start"] >= 0
            assert chunk["end"] >= chunk["start"]


class TestMarkVideoFailed:
    """Tests for marking video as failed"""

    @patch("app.services.video_processor.SessionLocal")
    def test_marks_video_failed(self, mock_session_local):
        """Test video is marked as failed"""
        mock_db = MagicMock()
        mock_video = MagicMock()
        mock_video.id = "test-id"
        mock_db.query.return_value.filter.return_value.first.return_value = mock_video
        mock_session_local.return_value = mock_db

        _mark_video_failed("test-id", "Test error")

        assert mock_video.status == VideoStatus.FAILED
        assert mock_video.error_message == "Test error"
        mock_db.commit.assert_called_once()

    @patch("app.services.video_processor.SessionLocal")
    def test_handles_nonexistent_video(self, mock_session_local):
        """Test handles video not found gracefully"""
        mock_db = MagicMock()
        mock_db.query.return_value.filter.return_value.first.return_value = None
        mock_session_local.return_value = mock_db

        # Should not raise
        _mark_video_failed("nonexistent-id", "Error")


class TestProcessVideoTaskTimeout:
    """Tests for task timeout configuration"""

    def test_timeout_defined(self):
        """Test timeout constant is defined"""
        assert TASK_TIMEOUT_SECONDS > 0
        assert isinstance(TASK_TIMEOUT_SECONDS, int)
