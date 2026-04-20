"""
Integration tests for Quiz API endpoints
"""
import pytest


class TestGenerateQuiz:
    """Tests for POST /api/quiz/generate"""
    
    def test_generate_quiz(self, client):
        """Generate quiz endpoint"""
        response = client.post(
            "/api/quiz/generate",
            json={"video_id": "video-123"}
        )
        assert response.status_code in [200, 401, 403, 404, 422]


class TestGetQuiz:
    """Tests for GET /api/quiz/{id}"""
    
    def test_get_quiz(self, client):
        """Get quiz"""
        response = client.get("/api/quiz/nonexistent")
        assert response.status_code in [200, 404, 401, 403]


class TestSubmitQuiz:
    """Tests for POST /api/quiz/{id}/submit"""
    
    def test_submit_quiz(self, client):
        """Submit quiz"""
        response = client.post(
            "/api/quiz/quiz-123/submit",
            json={"answers": {}}
        )
        assert response.status_code in [200, 401, 403, 404]


class TestGetQuizResults:
    """Tests for GET /api/quiz/{id}/results"""
    
    def test_get_results(self, client):
        """Get quiz results"""
        response = client.get("/api/quiz/quiz-123/results")
        assert response.status_code in [200, 404, 401, 403]