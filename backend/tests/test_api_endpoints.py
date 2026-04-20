"""
Tests for Chat API endpoints
"""
import pytest
from unittest.mock import patch, AsyncMock, MagicMock


class TestChatEndpoints:
    """Tests for chat API endpoints"""

    def test_send_message_video_not_found(self, client):
        """Test sending message to non-existent video"""
        response = client.post(
            "/api/chat",
            json={"videoId": "nonexistent", "message": "Hello"}
        )
        assert response.status_code == 404

    @patch("app.routers.chat.get_rag_response")
    async def test_send_message_success(self, mock_rag, client, db_session):
        """Test successful message sending"""
        mock_rag.return_value = {
            "message": "AI response",
            "references": [{"start": 10, "end": 20, "text": "Reference"}]
        }
        
        from app.models import Video, VideoStatus
        video = Video(
            id="chat-test-video",
            title="Test Video",
            status=VideoStatus.COMPLETED,
            transcript="Test transcript"
        )
        db_session.add(video)
        db_session.commit()
        
        response = client.post(
            "/api/chat",
            json={"videoId": video.id, "message": "What is this about?"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "references" in data

    def test_get_chat_history(self, client):
        """Test getting chat history"""
        video_response = client.post(
            "/api/videos/process-url",
            json={"url": "https://youtube.com/watch?v=history_test", "title": "History Test"}
        )
        video_id = video_response.json()["id"]
        
        response = client.get(f"/api/chat/{video_id}/history")
        
        assert response.status_code == 200
        data = response.json()
        assert data["video_id"] == video_id
        assert "messages" in data

    def test_clear_chat_history(self, client):
        """Test clearing chat history"""
        video_response = client.post(
            "/api/videos/process-url",
            json={"url": "https://youtube.com/watch?v=clear_test", "title": "Clear Test"}
        )
        video_id = video_response.json()["id"]
        
        response = client.delete(f"/api/chat/{video_id}/history")
        
        assert response.status_code == 200
        assert "cleared" in response.json()["message"].lower()


class TestQuizEndpoints:
    """Tests for quiz API endpoints"""

    def test_generate_quiz_video_not_found(self, client):
        """Test generating quiz for non-existent video"""
        response = client.post(
            "/api/quiz/generate",
            json={"videoId": "nonexistent", "questionCount": 5}
        )
        assert response.status_code == 404

    def test_generate_quiz_video_not_completed(self, client):
        """Test generating quiz for incomplete video"""
        video_response = client.post(
            "/api/videos/process-url",
            json={"url": "https://youtube.com/watch?v=incomplete", "title": "Incomplete"}
        )
        video_id = video_response.json()["id"]
        
        response = client.post(
            "/api/quiz/generate",
            json={"videoId": video_id, "questionCount": 5}
        )
        
        assert response.status_code == 400
        assert "not completed" in response.json()["detail"].lower()

    def test_get_quiz_not_found(self, client):
        """Test getting non-existent quiz"""
        response = client.get("/api/quiz/nonexistent-id")
        assert response.status_code == 404

    def test_submit_quiz_not_found(self, client):
        """Test submitting to non-existent quiz"""
        response = client.post(
            "/api/quiz/nonexistent/submit",
            json={"answers": {"q1": "a"}}
        )
        assert response.status_code == 404

    def test_get_quiz_results_not_found(self, client):
        """Test getting results for non-existent quiz"""
        response = client.get("/api/quiz/nonexistent/results")
        assert response.status_code == 404


class TestSearchEndpoints:
    """Tests for search API endpoints"""

    @patch("app.services.rag_service.collection")
    @patch("app.services.rag_service.get_embeddings")
    async def test_search_basic(self, mock_embeddings, mock_collection, client):
        """Test basic search functionality"""
        mock_embeddings.return_value = [[0.1] * 768]
        mock_collection.query.return_value = {
            "documents": [],
            "metadatas": [],
            "distances": []
        }
        
        response = client.post(
            "/api/search",
            json={"query": "Python", "limit": 10}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "query" in data
        assert "results" in data
        assert "total" in data

    @patch("app.services.rag_service.collection")
    @patch("app.services.rag_service.get_embeddings")
    async def test_search_with_video_filter(self, mock_embeddings, mock_collection, client):
        """Test search with video ID filter"""
        mock_embeddings.return_value = [[0.1] * 768]
        mock_collection.query.return_value = {
            "documents": [],
            "metadatas": [],
            "distances": []
        }
        
        response = client.post(
            "/api/search",
            json={"query": "test", "video_id": "some-video-id", "limit": 5}
        )
        
        assert response.status_code == 200

    def test_search_suggestions(self, client):
        """Test search suggestions endpoint"""
        response = client.get("/api/search/suggestions?q=python")
        
        assert response.status_code == 200
        assert "suggestions" in response.json()


class TestVideoModelMethods:
    """Tests for Video model methods"""

    def test_video_to_dict(self, db_session):
        """Test video to_dict method"""
        from app.models import Video, VideoStatus
        
        video = Video(
            id="test-id",
            title="Test Video",
            status=VideoStatus.PENDING
        )
        db_session.add(video)
        db_session.commit()
        
        data = video.to_dict()
        
        assert data["id"] == "test-id"
        assert data["title"] == "Test Video"
        assert data["status"] == "pending"
        assert "created_at" in data

    def test_video_to_dict_includes_transcript(self, db_session):
        """Test to_dict includes transcript"""
        from app.models import Video, VideoStatus
        
        video = Video(
            id="test-id-2",
            title="With Transcript",
            status=VideoStatus.COMPLETED,
            transcript="This is a transcript"
        )
        db_session.add(video)
        db_session.commit()
        
        data = video.to_dict()
        
        assert data["transcript"] == "This is a transcript"

    def test_video_progress_defaults_to_zero(self, db_session):
        """Test progress defaults to 0"""
        from app.models import Video
        
        video = Video(id="progress-test", title="Test")
        db_session.add(video)
        db_session.commit()
        
        data = video.to_dict()
        
        assert data["progress"] == 0


class TestChatModelMethods:
    """Tests for ChatMessage model methods"""

    def test_chat_message_to_dict(self, db_session):
        """Test chat message to_dict method"""
        from app.models import Video, ChatMessage, VideoStatus
        
        video = Video(id="vid-chat", title="Test", status=VideoStatus.COMPLETED)
        db_session.add(video)
        db_session.commit()
        
        msg = ChatMessage(
            video_id=video.id,
            role="user",
            content="Hello"
        )
        db_session.add(msg)
        db_session.commit()
        
        data = msg.to_dict()
        
        assert data["video_id"] == video.id
        assert data["role"] == "user"
        assert data["content"] == "Hello"
        assert "created_at" in data


class TestQuizModelMethods:
    """Tests for Quiz model methods"""

    def test_quiz_to_dict_without_answers(self, db_session):
        """Test quiz to_dict hides answers"""
        from app.models import Video, Quiz, VideoStatus
        
        video = Video(id="vid-quiz", title="Test", status=VideoStatus.COMPLETED)
        db_session.add(video)
        db_session.commit()
        
        quiz = Quiz(
            video_id=video.id,
            questions=[
                {"id": "q1", "question": "Test?", "correct_answer": "a", "options": []}
            ]
        )
        db_session.add(quiz)
        db_session.commit()
        
        data = quiz.to_dict(include_answers=False)
        
        assert "correct_answer" not in str(data["questions"][0])

    def test_quiz_to_dict_with_answers(self, db_session):
        """Test quiz to_dict shows answers when requested"""
        from app.models import Video, Quiz, VideoStatus
        
        video = Video(id="vid-quiz-2", title="Test", status=VideoStatus.COMPLETED)
        db_session.add(video)
        db_session.commit()
        
        quiz = Quiz(
            video_id=video.id,
            questions=[
                {"id": "q1", "question": "Test?", "correct_answer": "a"}
            ]
        )
        db_session.add(quiz)
        db_session.commit()
        
        data = quiz.to_dict(include_answers=True)
        
        assert data["questions"][0]["correct_answer"] == "a"

    def test_quiz_attempt_to_dict(self, db_session):
        """Test quiz attempt to_dict includes percentage"""
        from app.models import Video, Quiz, QuizAttempt, VideoStatus
        
        video = Video(id="vid-attempt", title="Test", status=VideoStatus.COMPLETED)
        db_session.add(video)
        db_session.commit()
        
        quiz = Quiz(video_id=video.id, questions=[{"id": "q1"}])
        db_session.add(quiz)
        db_session.commit()
        
        attempt = QuizAttempt(
            quiz_id=quiz.id,
            answers={"q1": "a"},
            score=8,
            total=10
        )
        db_session.add(attempt)
        db_session.commit()
        
        data = attempt.to_dict()
        
        assert data["score"] == 8
        assert data["total"] == 10
        assert data["percentage"] == 80.0
