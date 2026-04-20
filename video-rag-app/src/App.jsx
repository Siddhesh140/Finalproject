import { Routes, Route, Navigate } from 'react-router-dom'
import { VideoProvider, ChatProvider, QuizProvider, ThemeProvider, AuthProvider } from './context'
import { ErrorBoundary } from './components'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import Player from './pages/Player'
import Quiz from './pages/Quiz'
import Search from './pages/Search'
import QuizAnalysis from './pages/QuizAnalysis'
import Profile from './pages/Profile'
import Auth from './pages/Auth'

function App() {
  return (
    <VideoProvider>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <ChatProvider>
              <QuizProvider>
                <div className="min-h-screen transition-colors duration-300">
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/library" element={<Library />} />
                    <Route path="/player/:videoId?" element={<Player />} />
                    <Route path="/quiz" element={<Quiz />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/quiz-analysis/:quizId?" element={<QuizAnalysis />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </div>
              </QuizProvider>
            </ChatProvider>
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </VideoProvider>
  )
}

export default App


