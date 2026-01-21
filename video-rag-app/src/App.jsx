import { Routes, Route, Navigate } from 'react-router-dom'
import { VideoProvider, ChatProvider, QuizProvider } from './context'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import Player from './pages/Player'
import Quiz from './pages/Quiz'
import Search from './pages/Search'
import QuizAnalysis from './pages/QuizAnalysis'

function App() {
  return (
    <VideoProvider>
      <ChatProvider>
        <QuizProvider>
          <div className="bg-background-light min-h-screen">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/library" element={<Library />} />
              <Route path="/player/:videoId?" element={<Player />} />
              <Route path="/quiz/:quizId?" element={<Quiz />} />
              <Route path="/search" element={<Search />} />
              <Route path="/quiz-analysis/:quizId?" element={<QuizAnalysis />} />
            </Routes>
          </div>
        </QuizProvider>
      </ChatProvider>
    </VideoProvider>
  )
}

export default App
