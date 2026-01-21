import { Routes, Route, Navigate } from 'react-router-dom'
import { VideoProvider, ChatProvider, QuizProvider, ThemeProvider } from './context'
import { ErrorBoundary } from './components'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import Player from './pages/Player'
import Quiz from './pages/Quiz'
import Search from './pages/Search'
import QuizAnalysis from './pages/QuizAnalysis'
import Profile from './pages/Profile'

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <VideoProvider>
          <ChatProvider>
            <QuizProvider>
              <div className="bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/player/:videoId?" element={<Player />} />
                  <Route path="/quiz/:quizId?" element={<Quiz />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/quiz-analysis/:quizId?" element={<QuizAnalysis />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </div>
            </QuizProvider>
          </ChatProvider>
        </VideoProvider>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App

