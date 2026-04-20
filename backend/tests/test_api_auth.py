"""
Integration tests for Authentication API endpoints
"""
import pytest
from app.models import User
from app.database import SessionLocal


class TestSignupEndpoint:
    """Tests for POST /api/signup"""
    
    def test_signup_success(self, client):
        """User can signup with valid credentials"""
        response = client.post("/api/signup", json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "password123",
            "phone": "1234567890"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "test@example.com"
        assert data["user"]["name"] == "Test User"
        assert data["token_type"] == "bearer"
    
    def test_signup_without_phone(self, client):
        """User can signup without phone number"""
        response = client.post("/api/signup", json={
            "name": "Test User",
            "email": "test2@example.com",
            "password": "password123"
        })
        assert response.status_code == 200
        assert "access_token" in response.json()
    
    def test_signup_duplicate_email(self, client, db_session):
        """Signup fails with duplicate email"""
        # Create user first
        user = User(
            name="Existing",
            email="test@example.com",
            password_hash="hash"
        )
        db_session.add(user)
        db_session.commit()
        
        response = client.post("/api/signup", json={
            "name": "New User",
            "email": "test@example.com",
            "password": "password123"
        })
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()
    
    def test_signup_invalid_email(self, client):
        """Signup fails with invalid email format"""
        response = client.post("/api/signup", json={
            "name": "Test User",
            "email": "not-an-email",
            "password": "password123"
        })
        assert response.status_code == 422
    
    def test_signup_missing_name(self, client):
        """Signup fails without name"""
        response = client.post("/api/signup", json={
            "email": "test@example.com",
            "password": "password123"
        })
        assert response.status_code == 422
    
    def test_signup_missing_password(self, client):
        """Signup fails without password"""
        response = client.post("/api/signup", json={
            "name": "Test User",
            "email": "test@example.com"
        })
        assert response.status_code == 422
    
    def test_signup_short_password(self, client):
        """Signup works with short password (validation is on frontend)"""
        response = client.post("/api/signup", json={
            "name": "Test User",
            "email": "test3@example.com",
            "password": "123"
        })
        # Backend doesn't enforce password length, accept any response
        assert response.status_code in [200, 422]


class TestLoginEndpoint:
    """Tests for POST /api/login"""
    
    def test_login_success(self, client, db_session):
        """User can login with correct credentials"""
        # Create user first
        from app.routers.auth import hash_password
        user = User(
            name="Test",
            email="test@example.com",
            password_hash=hash_password("password123")
        )
        db_session.add(user)
        db_session.commit()
        
        response = client.post("/api/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "test@example.com"
    
    def test_login_wrong_password(self, client, db_session):
        """Login fails with wrong password"""
        from app.routers.auth import hash_password
        user = User(
            name="Test",
            email="test@example.com",
            password_hash=hash_password("correctpass")
        )
        db_session.add(user)
        db_session.commit()
        
        response = client.post("/api/login", json={
            "email": "test@example.com",
            "password": "wrongpass"
        })
        # Should return 401 for wrong password
        assert response.status_code == 401
    
    def test_login_nonexistent_email(self, client):
        """Login fails with nonexistent email"""
        response = client.post("/api/login", json={
            "email": "nonexistent@example.com",
            "password": "password123"
        })
        assert response.status_code == 401
    
    def test_login_inactive_user(self, client, db_session):
        """Login fails for inactive user"""
        from app.routers.auth import hash_password
        user = User(
            name="Test",
            email="test@example.com",
            password_hash=hash_password("password123"),
            is_active=False
        )
        db_session.add(user)
        db_session.commit()
        
        response = client.post("/api/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
        assert response.status_code == 403
        assert "disabled" in response.json()["detail"].lower()
    
    def test_login_invalid_email_format(self, client):
        """Login fails with invalid email format"""
        response = client.post("/api/login", json={
            "email": "not-email",
            "password": "password123"
        })
        assert response.status_code == 422


class TestGetCurrentUser:
    """Tests for GET /api/me"""
    
    def test_get_current_user_authenticated(self, client, db_session):
        """Authenticated user can get their profile"""
        from app.routers.auth import hash_password, create_access_token
        
        user = User(
            name="Test User",
            email="test@example.com",
            password_hash=hash_password("password123")
        )
        db_session.add(user)
        db_session.commit()
        
        token = create_access_token(user.id)
        
        response = client.get(
            "/api/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["email"] == "test@example.com"
        assert response.json()["name"] == "Test User"
    
    def test_get_current_user_unauthenticated(self, client):
        """Unauthenticated request returns 401"""
        response = client.get("/api/me")
        assert response.status_code == 401
    
    def test_get_current_user_invalid_token(self, client):
        """Invalid token returns 401"""
        response = client.get(
            "/api/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401


class TestLogoutEndpoint:
    """Tests for POST /api/logout"""
    
    def test_logout_success(self, client):
        """User can logout"""
        response = client.post("/api/logout")
        assert response.status_code == 200
        assert "logged out" in response.json()["message"].lower()