# Video-RAG Application

A full-stack Video-RAG (Retrieval Augmented Generation) application that processes videos, generates transcripts, enables AI-powered chat, and creates quizzes.

## Features

- **Video Processing** - Supports YouTube URLs and MP4 uploads
- **Transcription** - Automatic transcript generation
- **AI Chat** - RAG-powered Q&A about video content
- **Quiz Generation** - AI-generated quizzes from video content
- **Semantic Search** - Search across all video transcripts
- **Notes** - Take timestamped notes while watching videos

## Project Structure

```
├── video-rag-app/          # React Frontend (Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context for state management
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   └── types/          # TypeScript type definitions
│   └── ...
│
├── backend/                # FastAPI Backend
│   ├── app/
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routers/        # API endpoints
│   │   ├── services/       # Business logic (RAG, Quiz, Video)
│   │   └── schemas/        # Pydantic schemas
│   ├── tests/              # Unit tests
│   └── ...
│
├── docker-compose.yml      # Docker orchestration
└── README.md
```

## Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd video-rag-app

# Start with Docker
docker-compose up
```

### Manual Setup

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your API keys

# Run the server
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd video-rag-app

# Install dependencies
npm install

# Run the dev server
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Environment Variables

Create `backend/.env`:

```env
# Database
DATABASE_URL=sqlite:///./videorag.db

# Vector Database
CHROMA_PERSIST_DIR=./chroma_db

# AI Services (at least one required)
GOOGLE_API_KEY=your-google-gemini-key
OPENAI_API_KEY=your-openai-key

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=524288000

# Optional
DEBUG=true
```

## Testing

### Backend Tests

```bash
cd backend
source venv/bin/activate
pip install pytest pytest-asyncio
pytest tests/ -v
```

### Frontend Lint

```bash
cd video-rag-app
npm run lint
```

## API Endpoints

### Videos
- `GET /api/videos` - List all videos
- `GET /api/videos/{id}` - Get video details
- `POST /api/videos/process-url` - Process YouTube URL
- `POST /api/videos/upload` - Upload video file
- `POST /api/videos/{id}/like` - Toggle like
- `DELETE /api/videos/{id}` - Delete video

### Chat
- `POST /api/chat` - Send message (RAG-powered)
- `GET /api/chat/{video_id}/history` - Get chat history
- `DELETE /api/chat/{video_id}/history` - Clear history

### Quiz
- `POST /api/quiz/generate` - Generate quiz
- `GET /api/quiz/{id}` - Get quiz
- `POST /api/quiz/{id}/submit` - Submit answers
- `GET /api/quiz/{id}/results` - Get results

### Search
- `POST /api/search` - Semantic search
- `GET /api/search/suggestions` - Search suggestions

### Notes
- `GET /api/videos/{id}/notes` - List notes
- `POST /api/videos/{id}/notes` - Create note
- `DELETE /api/videos/{id}/notes/{note_id}` - Delete note

## Tech Stack

### Frontend
- React 19
- Vite
- TailwindCSS
- React Router
- Framer Motion

### Backend
- FastAPI
- SQLAlchemy (SQLite)
- ChromaDB (Vector DB)
- Google Gemini / OpenAI GPT

### Infrastructure
- Docker / Docker Compose
- Python 3.12

## Development

### Running Tests

```bash
# Backend
cd backend && pytest tests/ -v

# With coverage
pytest tests/ --cov=app --cov-report=html
```

### Code Quality

```bash
# Lint frontend
cd video-rag-app && npm run lint

# Format code (if configured)
npm run format
```

## Deployment

### Docker Deployment

```bash
# Production build
docker-compose -f docker-compose.yml up -d

# With custom API keys
GOOGLE_API_KEY=your-key docker-compose up -d
```

### Manual Deployment

1. Set up a Python 3.12 environment
2. Install dependencies: `pip install -r requirements.txt`
3. Configure environment variables
4. Run: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
5. Build frontend: `cd video-rag-app && npm run build`
6. Serve frontend statically or with Nginx

## License

MIT License - See LICENSE file for details.

## Team

Final Year Project - Computer Science
