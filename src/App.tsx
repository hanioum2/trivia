import { useState } from 'react'
import { useSearchParams, Routes, Route } from 'react-router-dom'
import StartPage from './components/StartPage'
import QuizPage from './components/QuizPage'
import ResultsPage from './components/ResultsPage'
import ScoreboardPage from './components/ScoreboardPage'
import ProtectedRoute from './components/admin/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import QuizListPage from './components/admin/QuizListPage'
import QuizFormPage from './components/admin/QuizFormPage'
import QuestionsPage from './components/admin/QuestionsPage'
import { Language, GameResult } from './types'
import { useQuizConfig } from './hooks/useQuizConfig'

type GameState = 'start' | 'quiz' | 'results'

function App() {
  const [searchParams] = useSearchParams()
  const quizId = searchParams.get('quiz') || null
  const { config, loading } = useQuizConfig(quizId)
  
  const [gameState, setGameState] = useState<GameState>('start')
  const [playerName, setPlayerName] = useState('')
  const [language, setLanguage] = useState<Language>('en')
  const [gameResult, setGameResult] = useState<GameResult | null>(null)

  const handleStart = (name: string, lang: Language) => {
    setPlayerName(name)
    setLanguage(lang)
    setGameState('quiz')
  }

  const handleQuizComplete = async (result: GameResult) => {
    // Score upload happens in ResultsPage component after results are shown
    setGameResult({ ...result, quizId: quizId || undefined })
    setGameState('results')
  }

  const handleGoHome = () => {
    setGameState('start')
    setPlayerName('')
    setGameResult(null)
  }

  if (loading) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.5rem'
      }}>
        Loading quiz...
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/scoreboard"
        element={<ScoreboardPage />}
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <QuizListPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/quizzes"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <QuizListPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/quizzes/new"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <QuizFormPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/quizzes/:id"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <QuizFormPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/quizzes/:id/questions"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <QuestionsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <>
            {gameState === 'start' && (
              <StartPage onStart={handleStart} config={config} />
            )}
            {gameState === 'quiz' && (
              <QuizPage
                playerName={playerName}
                language={language}
                onComplete={handleQuizComplete}
                config={config}
                quizId={quizId}
              />
            )}
            {gameState === 'results' && gameResult && (
              <ResultsPage
                result={gameResult}
                onGoHome={handleGoHome}
                config={config}
              />
            )}
          </>
        }
      />
    </Routes>
  )
}

export default App
