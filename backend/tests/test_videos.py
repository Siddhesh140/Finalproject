"""
Tests for Video API endpoints
"""


def test_health_check(client):
    """Test health endpoint returns healthy status"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_root_endpoint(client):
    """Test root endpoint returns API info"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data


def test_get_all_videos_empty(client):
    """Test getting videos when database is empty"""
    response = client.get("/api/videos")
    assert response.status_code == 200
    assert response.json() == []


def test_process_video_url(client):
    """Test processing a video URL creates a video record"""
    response = client.post(
        "/api/videos/process-url",
        json={"url": "https://www.youtube.com/watch?v=test123", "title": "Test Video"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["title"] == "Test Video"
    assert data["status"] == "pending"


def test_get_video_not_found(client):
    """Test getting non-existent video returns 404"""
    response = client.get("/api/videos/nonexistent-id")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_delete_video(client):
    """Test deleting a video"""
    # First create a video
    create_response = client.post(
        "/api/videos/process-url",
        json={"url": "https://youtube.com/watch?v=delete_test", "title": "To Delete"}
    )
    video_id = create_response.json()["id"]
    
    # Delete it
    delete_response = client.delete(f"/api/videos/{video_id}")
    assert delete_response.status_code == 200
    
    # Verify it's gone
    get_response = client.get(f"/api/videos/{video_id}")
    assert get_response.status_code == 404


def test_toggle_like(client):
    """Test toggling video like status"""
    # Create a video
    create_response = client.post(
        "/api/videos/process-url",
        json={"url": "https://youtube.com/watch?v=like_test", "title": "Like Test"}
    )
    video_id = create_response.json()["id"]
    
    # Toggle like
    like_response = client.post(f"/api/videos/{video_id}/like")
    assert like_response.status_code == 200
    assert like_response.json()["is_liked"] == True
    
    # Toggle again
    unlike_response = client.post(f"/api/videos/{video_id}/like")
    assert unlike_response.status_code == 200
    assert unlike_response.json()["is_liked"] == False
