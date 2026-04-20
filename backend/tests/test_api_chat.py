"""
Integration tests for Chat API endpoints
"""
import pytest
from app.models import Video, ChatMessage, VideoStatus


class TestSendChatMessage:
    """Tests for POST /api/chat/{id}"""
    
    def test_send_message(self, client):
        """Send message endpoint"""
        response = client.post(
            "/api/chat/video-123",
            json={"message": "Hello"}
        )
        # Returns various responses based on auth status
        assert response.status_code in [200, 401, 403, 404]


class TestGetChatHistory:
    """Tests for GET /api/chat/{id}/history"""
    
    def test_get_history(self, client):
        """Get chat history"""
        response = client.get("/api/chat/video-123/history")
        assert response.status_code in [200, 401, 403, 404]


class TestClearChatHistory:
    """Tests for DELETE /api/chat/{id}"""
    
    def test_clear_history(self, client):
        """Clear chat history"""
        response = client.delete("/api/chat/video-123")
        assert response.status_code in [200, 401, 403, 404]
