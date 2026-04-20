"""
Unit tests for authentication module
"""
import pytest
from app.routers.auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_token,
)


class TestPasswordHashing:
    """Tests for password hashing functions"""
    
    def test_hash_password_returns_string(self):
        """Hash password should return a string"""
        result = hash_password("test123")
        assert isinstance(result, str)
        assert result != "test123"
    
    def test_hash_password_different_hashes_for_same_password(self):
        """Same password should produce different hashes (salt)"""
        hash1 = hash_password("test123")
        hash2 = hash_password("test123")
        assert hash1 != hash2
    
    def test_verify_password_correct(self):
        """Verify password should return True for correct password"""
        hashed = hash_password("test123")
        assert verify_password("test123", hashed) is True
    
    def test_verify_password_incorrect(self):
        """Verify password should return False for incorrect password"""
        hashed = hash_password("test123")
        assert verify_password("wrong", hashed) is False
    
    def test_verify_password_empty(self):
        """Verify password should handle empty password"""
        hashed = hash_password("test123")
        assert verify_password("", hashed) is False


class TestJWTTokens:
    """Tests for JWT token functions"""
    
    def test_create_access_token_returns_string(self):
        """Create token should return a JWT string"""
        result = create_access_token("user123")
        assert isinstance(result, str)
        assert result.startswith("eyJ")
    
    def test_decode_token_returns_payload(self):
        """Decode token should return payload with user_id"""
        token = create_access_token("user123")
        payload = decode_token(token)
        assert payload["sub"] == "user123"
        assert "exp" in payload
    
    def test_decode_token_invalid_raises(self):
        """Invalid token should raise error"""
        with pytest.raises(Exception):
            decode_token("invalid.token.here")
    
    def test_token_contains_expiration(self):
        """Token should contain expiration time"""
        token = create_access_token("user123")
        payload = decode_token(token)
        assert payload["exp"] > 0
    
    def test_access_token_same_for_same_user_at_same_time(self):
        """Same user at same time gets same token (not a security issue for this case)"""
        token1 = create_access_token("user123")
        token2 = create_access_token("user123")
        # Token is the same if created at same moment
        assert token1 == token2