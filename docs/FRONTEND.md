# Frontend Documentation

A comprehensive guide to the Video-RAG Frontend built with React and Vite.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Pages](#pages)
5. [Components](#components)
6. [Context (State Management)](#context-state-management)
7. [API Services](#api-services)
8. [Styling](#styling)
9. [Running the Application](#running-the-application)

---

## Overview

The frontend is a **React 19 Single Page Application (SPA)** built with Vite. It provides:

- Video library management (YouTube URLs & uploads)
- Video player with embedded chat
- AI-powered Q&A about video content
- Quiz generation and analysis
- Semantic search across all videos
- Dark/Light theme support
- Responsive mobile-friendly design

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI library (latest version) |
| **Vite** | 7.2.4 | Build tool & dev server |
| **TailwindCSS** | 4.1.18 | Utility-first CSS framework |
| **React Router** | 7.12.0 | Client-side routing |
| **Framer Motion** | 12.27.5 | Animation library |
| **PropTypes** | 15.8.1 | Runtime type checking |
| **ESLint** | 9.39.1 | Code linting |

---

## Project Structure

```
video-rag-app/
├── public/               # Static assets
├── src/
│   ├── App.jsx          # Root component with routing
│   ├── main.jsx         # React entry point
│   ├── index.css        # Global styles & Tailwind
│   ├── App.css          # App-specific styles
│   │
│   ├── pages/           # Route page components
│   │   ├── Auth.jsx         # Login/Signup page
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   ├── Library.jsx      # Video library
│   │   ├── Player.jsx       # Video player + chat
│   │   ├── Quiz.jsx         # Quiz taking interface
│   │   ├── QuizAnalysis.jsx # Quiz results analysis
│   │   ├── Search.jsx       # Semantic search
│   │   └── Profile.jsx      # User profile
│   │
│   ├── components/      # Reusable UI components
│   │   ├── Header.jsx           # Navigation header
│   │   ├── VideoCard.jsx        # Video thumbnail card
│   │   ├── BottomNavDashboard.jsx   # Mobile nav
│   │   ├── BottomNavLibrary.jsx     # Mobile nav
│   │   ├── BottomNavSearch.jsx      # Mobile nav
│   │   ├── ConfirmModal.jsx     # Confirmation dialog
│   │   ├── ErrorBoundary.jsx    # Error handling
│   │   ├── ErrorMessage.jsx     # Error display
│   │   ├── LoadingSpinner.jsx   # Loading indicator
│   │   └── index.js             # Exports
│   │
│   ├── context/         # React Context providers
│   │   ├── VideoContext.jsx  # Video state management
│   │   ├── ChatContext.jsx   # Chat state management
│   │   ├── QuizContext.jsx   # Quiz state management
│   │   ├── ThemeContext.jsx  # Theme (dark/light)
│   │   └── index.js          # Exports
│   │
│   ├── services/        # API communication
│   │   └── api.js       # API client functions
│   │
│   └── assets/          # Images, icons, etc.
│
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
└── eslint.config.js     # ESLint configuration
```

---

## Pages

### Auth Page (`Auth.jsx`)

Authentication page with login/signup functionality.

**Features:**
- Toggle between Login and Signup modes
- Form validation
- Password visibility toggle
- Forgot password flow
- Animated transitions

### Dashboard (`Dashboard.jsx`)

Main landing page after authentication.

**Features:**
- Welcome section with stats
- Recent videos grid
- Quick actions (upload, search)
- Activity summary

### Library (`Library.jsx`)

Video library management.

**Features:**
- Grid/List view toggle
- Upload new videos
- Filter by status (processing, completed)
- Like/unlike videos
- Delete videos

### Player (`Player.jsx`)

Video playback with AI chat integration.

**Features:**
- YouTube embed player
- Local video player for uploads
- Collapsible transcript panel
- AI Chat sidebar (RAG-powered)
- Notes with timestamps
- Quiz generation button
- Share functionality

### Quiz (`Quiz.jsx`)

Quiz taking interface.

**Features:**
- Question navigation
- Progress indicator
- Answer selection
- Timer (optional)
- Submit and review

### QuizAnalysis (`QuizAnalysis.jsx`)

Quiz results and feedback.

**Features:**
- Score breakdown
- Correct/incorrect answers review
- AI-generated analysis
- Knowledge gap identification
- Retry option

### Search (`Search.jsx`)

Semantic search across videos.

**Features:**
- Search input with suggestions
- Filter by video
- Results with relevance scores
- Click to navigate with timestamp

### Profile (`Profile.jsx`)

User profile and settings.

**Features:**
- Profile information
- Theme toggle
- Statistics
- Account settings

---

## Components

### Header (`Header.jsx`)

Top navigation bar.

```jsx
<Header />
```

**Features:**
- Logo and app name
- Navigation links
- Theme toggle button
- Profile menu

### VideoCard (`VideoCard.jsx`)

Thumbnail card for video display.

```jsx
<VideoCard
  video={videoObject}
  onPlay={handlePlay}
  onDelete={handleDelete}
  onLike={handleLike}
/>
```

### ErrorBoundary (`ErrorBoundary.jsx`)

React Error Boundary for graceful error handling.

```jsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### ConfirmModal (`ConfirmModal.jsx`)

Reusable confirmation dialog.

```jsx
<ConfirmModal
  isOpen={showModal}
  title="Confirm Delete"
  message="Are you sure?"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
```

### LoadingSpinner (`LoadingSpinner.jsx`)

Animated loading indicator.

```jsx
<LoadingSpinner size="lg" />
```

---

## Context (State Management)

The app uses React Context API for state management, avoiding external libraries like Redux.

### VideoContext

Manages video-related state.

```jsx
const { 
  videos,           // Array of video objects
  loading,          // Loading state
  error,            // Error message
  fetchVideos,      // Refresh videos
  addVideo,         // Add new video
  deleteVideo,      // Remove video
  toggleLike        // Like/unlike video
} = useVideo();
```

### ChatContext

Manages chat/AI conversation state.

```jsx
const {
  messages,         // Chat history
  loading,          // Sending message
  sendMessage,      // Send to AI
  clearHistory      // Reset chat
} = useChat();
```

### QuizContext

Manages quiz state.

```jsx
const {
  quiz,             // Current quiz
  results,          // Quiz results
  generateQuiz,     // Create new quiz
  submitQuiz,       // Submit answers
  getResults        // Fetch analysis
} = useQuiz();
```

### ThemeContext

Manages dark/light theme.

```jsx
const { 
  theme,            // 'dark' or 'light'
  toggleTheme       // Switch theme
} = useTheme();
```

---

## API Services

The API client (`services/api.js`) provides clean abstractions for backend communication.

### Video API

```javascript
import { videoAPI } from './services/api';

// List all videos
const videos = await videoAPI.getAll();

// Get single video
const video = await videoAPI.getById(id);

// Process YouTube URL
const result = await videoAPI.processUrl(url, title);

// Upload file
const uploaded = await videoAPI.upload(file, title);

// Toggle like
await videoAPI.toggleLike(id);

// Delete video
await videoAPI.delete(id);
```

### Chat API

```javascript
import { chatAPI } from './services/api';

// Send message
const response = await chatAPI.sendMessage(videoId, message);

// Get history
const history = await chatAPI.getHistory(videoId);

// Clear history
await chatAPI.clearHistory(videoId);
```

### Quiz API

```javascript
import { quizAPI } from './services/api';

// Generate quiz
const quiz = await quizAPI.generate(videoId, 10);

// Submit answers
const result = await quizAPI.submit(quizId, answers);

// Get analysis
const analysis = await quizAPI.getResults(quizId);
```

### Search API

```javascript
import { searchAPI } from './services/api';

// Search videos
const results = await searchAPI.search(query);

// Get suggestions
const suggestions = await searchAPI.suggestions(query);
```

---

## Styling

### TailwindCSS 4

The app uses TailwindCSS 4 with the Vite plugin for zero-config setup.

**Configuration:**
```javascript
// vite.config.js
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

### Dark Mode

Theme toggling uses Tailwind's `dark:` variant:

```jsx
<div className="bg-white dark:bg-gray-900">
  <p className="text-black dark:text-white">Content</p>
</div>
```

### Custom Colors (index.css)

Custom color scheme defined in CSS:

```css
:root {
  --background-light: #f5f5f7;
  --background-dark: #0f0f0f;
  --primary: #6366f1;
  --secondary: #22c55e;
}
```

### Animations (Framer Motion)

Smooth animations using Framer Motion:

```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Animated Content
</motion.div>
```

---

## Running the Application

### Development

```bash
# Navigate to frontend directory
cd video-rag-app

# Install dependencies
npm install

# Set environment variables (optional)
cp .env.example .env

# Start development server
npm run dev

# Open in browser
open http://localhost:5173
```

### Production Build

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create `.env` in `video-rag-app/`:

```env
# Backend API URL (default: http://localhost:8000/api)
VITE_API_URL=http://localhost:8000/api
```

---

## Routing

React Router v7 handles client-side navigation:

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Redirect to `/auth` | Entry point |
| `/auth` | Auth | Login/Signup |
| `/dashboard` | Dashboard | Main dashboard |
| `/library` | Library | Video library |
| `/player/:videoId?` | Player | Video playback |
| `/quiz/:quizId?` | Quiz | Take quiz |
| `/quiz-analysis/:quizId?` | QuizAnalysis | View results |
| `/search` | Search | Semantic search |
| `/profile` | Profile | User settings |

---

## Best Practices Used

1. **Component Composition** - Small, reusable components
2. **Context API** - Avoids prop drilling
3. **Custom Hooks** - Encapsulated logic
4. **Error Boundaries** - Graceful error handling
5. **PropTypes** - Runtime type checking
6. **ESLint** - Code quality enforcement
7. **Responsive Design** - Mobile-first approach
8. **Dark Mode** - User preference support
