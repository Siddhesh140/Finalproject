"""
Tests for Notes API endpoints
"""


def test_get_notes_video_not_found(client):
    """Test getting notes for non-existent video returns 404"""
    response = client.get("/api/videos/nonexistent/notes")
    assert response.status_code == 404


def test_create_and_get_notes(client):
    """Test creating and retrieving notes"""
    # First create a video
    video_response = client.post(
        "/api/videos/process-url",
        json={"url": "https://youtube.com/watch?v=notes_test", "title": "Notes Test"}
    )
    video_id = video_response.json()["id"]
    
    # Create a note
    note_response = client.post(
        f"/api/videos/{video_id}/notes",
        json={"content": "This is a test note", "timestamp": 120}
    )
    assert note_response.status_code == 200
    note_data = note_response.json()
    assert note_data["content"] == "This is a test note"
    assert note_data["timestamp"] == 120
    
    # Get notes
    get_response = client.get(f"/api/videos/{video_id}/notes")
    assert get_response.status_code == 200
    notes = get_response.json()
    assert len(notes) == 1


def test_delete_note(client):
    """Test deleting a note"""
    # Create video and note
    video_response = client.post(
        "/api/videos/process-url",
        json={"url": "https://youtube.com/watch?v=delete_note", "title": "Delete Note Test"}
    )
    video_id = video_response.json()["id"]
    
    note_response = client.post(
        f"/api/videos/{video_id}/notes",
        json={"content": "To be deleted", "timestamp": 60}
    )
    note_id = note_response.json()["id"]
    
    # Delete note
    delete_response = client.delete(f"/api/videos/{video_id}/notes/{note_id}")
    assert delete_response.status_code == 200
    
    # Verify it's gone
    get_response = client.get(f"/api/videos/{video_id}/notes")
    assert len(get_response.json()) == 0
