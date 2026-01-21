# Video-RAG Application

A full-stack Video-RAG (Retrieval Augmented Generation) application that processes videos, generates transcripts, enables AI-powered chat, and creates quizzes.

## Project Structure

```
├── video-rag-app/          # React Frontend (Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context for state management
│   │   ├── pages/          # Page components
│   │   └── services/       # API client
│   └── ...
│
└── backend/                # FastAPI Backend
    ├── app/
    │   ├── models/         # SQLAlchemy models
    │   ├── routers/        # API endpoints
    │   ├── services/       # Business logic (RAG, Quiz, Video processing)
    │   └── schemas/        # Pydantic schemas
    └── ...
```

## Features

- 📹 **Video Processing** - Supports YouTube URLs and MP4 uploads
- 🎙️ **Transcription** - Automatic transcription using Whisper
- 💬 **AI Chat** - RAG-powered Q&A about video content
- 📝 **Quiz Generation** - AI-generated quizzes from video content
- 🔍 **Semantic Search** - Search across all video transcripts

## Getting Started

### Frontend

```bash
cd video-rag-app
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Add your API keys
uvicorn app.main:app --reload --port 8000
```

## Environment Variables

Create `backend/.env` with:

```env
DATABASE_URL=sqlite:///./videorag.db
OPENAI_API_KEY=your-key-here
# or
GOOGLE_API_KEY=your-key-here
```

## Tech Stack

**Frontend:**
- React 18
- Vite
- TailwindCSS
- React Router

**Backend:**
- FastAPI
- SQLAlchemy
- ChromaDB (Vector DB)
- OpenAI / Google Gemini

## Team

Built for our final project!
