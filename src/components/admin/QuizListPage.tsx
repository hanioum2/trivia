import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getQuizzes, deleteQuiz } from '../../services/adminService'
import './QuizListPage.css'

interface Quiz {
  id: string
  title: string
  created_at: string
}

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadQuizzes()
  }, [])

  const loadQuizzes = async () => {
    setLoading(true)
    const { data, error } = await getQuizzes()
    if (error) {
      console.error('Error loading quizzes:', error)
    } else {
      setQuizzes(data || [])
    }
    setLoading(false)
  }

  const handleDelete = async (quizId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will also delete all questions and scores.`)) {
      return
    }

    const { error } = await deleteQuiz(quizId)
    if (error) {
      alert('Error deleting quiz: ' + error.message)
    } else {
      loadQuizzes()
    }
  }

  if (loading) {
    return <div className="loading">Loading quizzes...</div>
  }

  return (
    <div className="quiz-list-page">
      <div className="page-header">
        <h1>Quizzes</h1>
        <button onClick={() => navigate('/admin/quizzes/new')} className="create-button">
          + Create New Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="empty-state">
          <p>No quizzes yet. Create your first quiz!</p>
        </div>
      ) : (
        <div className="quiz-grid">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card">
              <h3>{quiz.title}</h3>
              <p className="quiz-id">ID: {quiz.id}</p>
              <p className="quiz-date">
                Created: {new Date(quiz.created_at).toLocaleDateString()}
              </p>
              <div className="quiz-actions">
                <button
                  onClick={() => navigate(`/admin/quizzes/${quiz.id}`)}
                  className="edit-button"
                >
                  Edit Config
                </button>
                <button
                  onClick={() => navigate(`/admin/quizzes/${quiz.id}/questions`)}
                  className="questions-button"
                >
                  Questions
                </button>
                <button
                  onClick={() => handleDelete(quiz.id, quiz.title)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

