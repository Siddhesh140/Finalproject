# Video-RAG Application - Test Plan

## Overview
This document outlines a comprehensive testing strategy for the Video-RAG application following industry best practices.

## Testing Pyramid

```
        /\
       /E2E\          ← Few, High-value end-to-end tests
      /------\
     /Integration\    ← Moderate, Test component interactions  
    /------------\
   /   Unit      \   ← Many, Fast, Isolated tests
  /--------------\
```

---

## 1. Unit Tests (70% of tests)

### 1.1 Backend - Authentication

| Test File | Tests |
|-----------|-------|
| `test_auth.py` | - Password hashing with bcrypt <br> - JWT token creation/validation <br> - Token expiration <br> - Invalid token handling <br> - User creation <br> - Duplicate email prevention |

```python
# Example tests to add
def test_password_hashing():
    """Test that passwords are properly hashed"""
    password = "test123"
    hashed = hash_password(password)
    assert verify_password(password, hashed) == True
    assert verify_password("wrong", hashed) == False

def test_jwt_token_creation():
    """Test JWT token creation with correct claims"""
    token = create_access_token("user123")
    payload = decode_token(token)
    assert payload["sub"] == "user123"
```

### 1.2 Backend - Video Processing

| Test File | Tests |
|-----------|-------|
| `test_video_processor.py` | - YouTube URL extraction <br> - Video ID parsing <br> - URL validation <br> - Duration formatting |

```python
# Existing tests to enhance
def test_extract_youtube_id_from_watch_url():
    url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    assert extract_youtube_id(url) == "dQw4w9WgXcQ"

def test_extract_youtube_id_from_short_url():
    url = "https://youtu.be/dQw4w9WgXcQ"
    assert extract_youtube_id(url) == "dQw4w9WgXcQ"
```

### 1.3 Backend - RAG Service

| Test File | Tests |
|-----------|-------|
| `test_rag_service.py` | - Text chunking <br> - Embedding generation <br> - Similarity search <br> - Context formatting |

### 1.4 Backend - Quiz Service

| Test File | Tests |
|-----------|-------|
| `test_quiz_service.py` | - Question parsing <br> - Answer validation <br> - Score calculation |

### 1.5 Backend - Models

| Test File | Tests |
|-----------|-------|
| `test_models.py` | - User model serialization <br> - Video model relationships <br> - ChatMessage ordering <br> - QuizAttempt scoring |

### 1.6 Frontend - Components (using Vitest/Jest)

| Test File | Tests |
|-----------|-------|
| `components/Button.test.jsx` | - Rendering <br> - Click handlers <br> - Disabled state |
| `components/Sidebar.test.jsx` | - Navigation links <br> - Active state |
| `components/VideoCard.test.jsx` | - Thumbnail display <br> - Title truncation |
| `context/AuthContext.test.jsx` | - Login flow <br> - Logout flow <br> - Token storage |

---

## 2. Integration Tests (20% of tests)

### 2.1 Backend - API Endpoints

| Test File | Tests |
|-----------|-------|
| `test_api_auth.py` | - POST /api/signup (success, duplicate email, invalid email) <br> - POST /api/login (success, wrong password, invalid email) <br> - GET /api/me (authenticated, unauthenticated) |
| `test_api_videos.py` | - GET /api/videos (empty, with videos) <br> - POST /api/videos/process-url <br> - GET /api/videos/{id} <br> - DELETE /api/videos/{id} |
| `test_api_chat.py` | - POST /api/chat/{id} (send message) <br> - GET /api/chat/{id}/history |
| `test_api_quiz.py` | - POST /api/quiz/generate <br> - GET /api/quiz/{id} <br> - POST /api/quiz/{id}/submit |
| `test_api_search.py` | - POST /api/search |
| `test_api_notes.py` | - GET/POST/DELETE /api/notes |

```python
# Example API test
def test_signup_success(client):
    response = client.post("/api/signup", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["user"]["email"] == "test@example.com"

def test_signup_duplicate_email(client, db_session):
    # Create user first
    user = User(email="test@example.com", password_hash="hash")
    db_session.add(user)
    db_session.commit()
    
    # Try to create duplicate
    response = client.post("/api/signup", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]
```

### 2.2 Frontend - Page Tests (using React Testing Library)

| Test File | Tests |
|-----------|-------|
| `pages/Dashboard.test.jsx` | - Page renders <br> - Video list displays <br> - Upload form works |
| `pages/Auth.test.jsx` | - Login form renders <br> - Signup form renders <br> - Form validation |
| `pages/Player.test.jsx` | - Video player loads <br> - Chat tab works |

---

## 3. E2E Tests (10% of tests)

### 3.1 Using Playwright

| Test File | Tests |
|-----------|-------|
| `e2e/auth.spec.ts` | - User can signup <br> - User can login <br> - User can logout <br> - Invalid credentials show error |
| `e2e/video.spec.ts` | - User can add YouTube video <br> - Video appears in library <br> - Video plays correctly |
| `e2e/chat.spec.ts` | - User can send message <br> - AI responds <br> - Chat history persists |
| `e2e/quiz.spec.ts` | - User can generate quiz <br> - User can answer questions <br> - Results display correctly |
| `e2e/navigation.spec.ts` | - All routes accessible <br> - Sidebar navigation works <br> - Mobile navigation works |

```typescript
// Example E2E test
test('user can signup and login', async ({ page }) => {
  await page.goto('http://localhost:5173/auth');
  
  // Signup
  await page.click('text=Sign Up');
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button:has-text("Sign Up")');
  
  // Should redirect to dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Welcome back')).toBeVisible();
});
```

---

## 4. Test Coverage Goals

| Category | Current | Target |
|----------|---------|--------|
| Backend Unit Tests | 60% | 85% |
| Backend API Coverage | 70% | 90% |
| Frontend Components | 40% | 70% |
| E2E Critical Paths | 3 | 10 |

---

## 5. Test Execution Strategy

### 5.1 Local Development
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py -v

# Run E2E tests
playwright test
```

### 5.2 CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-cov
      - name: Run backend tests
        run: pytest --cov=app
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install frontend deps
        run: cd video-rag-app && npm install
      - name: Run frontend tests
        run: cd video-rag-app && npm test
      - name: Run E2E tests
        run: cd video-rag-app && playwright test
```

---

## 6. Testing Best Practices

### 6.1 AAA Pattern
```python
def test_example():
    # Arrange
    user = User(name="Test")
    
    # Act
    result = user.to_dict()
    
    # Assert
    assert result["name"] == "Test"
```

### 6.2 Test Naming Convention
```
test_<module>_<function>_<expected_behavior>
test_auth_login_returns_token_on_valid_credentials
test_video_delete_removes_from_database
```

### 6.3 Test Data
- Use factories (e.g., `factory-boy`) for creating test data
- Use fixtures for reusable test data
- Keep test data minimal and focused

### 6.4 Mocking
- Mock external APIs (AI services, file storage)
- Use `unittest.mock` for patching
- Don't mock database in integration tests

---

## 7. Files to Create/Update

### New Backend Test Files
```
backend/tests/
├── conftest.py                 ✓ (exists)
├── test_auth.py               [CREATE]
├── test_models.py             [CREATE]
├── test_api_auth.py           [UPDATE]
├── test_api_videos.py         [UPDATE]
├── test_api_chat.py           [UPDATE]
├── test_api_quiz.py           [UPDATE]
├── test_video_processor.py    [UPDATE]
├── test_rag_service.py        [UPDATE]
└── test_quiz_service.py       [UPDATE]
```

### New Frontend Test Files
```
video-rag-app/
├── vitest.config.js           [CREATE]
├── src/
│   ├── __tests__/
│   │   ├── Button.test.jsx   [CREATE]
│   │   ├── Sidebar.test.jsx  [CREATE]
│   │   ├── AuthContext.test.jsx [CREATE]
│   │   └── Dashboard.test.jsx [CREATE]
│   └── components/
└── e2e/
    ├── auth.spec.ts           [UPDATE]
    ├── video.spec.ts          [CREATE]
    ├── chat.spec.ts           [CREATE]
    ├── quiz.spec.ts           [CREATE]
    └── navigation.spec.ts     [CREATE]
```

---

## 8. Implementation Priority

| Priority | Tests | Reason |
|----------|-------|--------|
| 1 | Backend Auth Unit Tests | Core functionality |
| 2 | Backend API Auth | Security critical |
| 3 | Backend Video API | Main feature |
| 4 | Backend RAG/Quiz Services | AI features |
| 5 | E2E Auth Flow | User onboarding |
| 6 | E2E Video Flow | Core feature |
| 7 | Frontend Component Tests | UI reliability |
| 8 | E2E Chat/Quiz | Secondary features |

---

## 9. Running Tests

```bash
# Install test dependencies
cd backend && pip install pytest pytest-cov pytest-asyncio
cd video-rag-app && npm install -D vitest @testing-library/react @playwright/test

# Run all backend tests
cd backend && pytest -v --cov=app --cov-report=html

# Run all frontend tests  
cd video-rag-app && npm test

# Run E2E tests
cd video-rag-app && npx playwright test

# Run specific test
pytest tests/test_auth.py::test_login_success -v
```

---

## Summary

This test plan provides:
- **70% Unit Tests** - Fast, isolated tests for business logic
- **20% Integration Tests** - Test component interactions
- **10% E2E Tests** - High-value user journey tests

Total: ~100+ tests when fully implemented

The plan follows industry standards and will ensure the application is reliable, maintainable, and production-ready.
