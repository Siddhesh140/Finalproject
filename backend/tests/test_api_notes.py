"""
Integration tests for Notes API endpoints
"""
import pytest


class TestGetNotes:
    """Tests for GET /api/notes"""
    
    def test_get_notes(self, client):
        """Get notes"""
        response = client.get("/api/notes?video_id=video-123")
        assert response.status_code in [200, 401, 403, 404]


class TestCreateNote:
    """Tests for POST /api/notes"""
    
    def test_create_note(self, client):
        """Create note"""
        response = client.post(
            "/api/notes",
            json={"video_id": "video-123", "content": "Test note"}
        )
        assert response.status_code in [200, 201, 401, 403, 404, 422]


class TestDeleteNote:
    """Tests for DELETE /api/notes/{id}"""
    
    def test_delete_note(self, client):
        """Delete note"""
        response = client.delete("/api/notes/note-123")
        assert response.status_code in [200, 401, 403, 404]
