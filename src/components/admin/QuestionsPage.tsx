import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getQuiz,
  getQuizQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion
} from '../../services/adminService'
import './QuestionsPage.css'

interface Question {
  id: number
  quiz_id: string
  question_en: string
  question_ar: string
  options_en: string[]
  options_ar: string[]
  correct_answer: number
}

export default function QuestionsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    const [quizResult, questionsResult] = await Promise.all([
      getQuiz(id),
      getQuizQuestions(id)
    ])
    
    if (quizResult.data) setQuiz(quizResult.data)
    if (questionsResult.data) setQuestions(questionsResult.data || [])
    setLoading(false)
  }

  const handleDelete = async (questionId: number) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return
    }

    const { error } = await deleteQuestion(questionId)
    if (error) {
      alert('Error deleting question: ' + error.message)
    } else {
      loadData()
    }
  }

  const handleSave = () => {
    setEditingId(null)
    setShowAddForm(false)
    loadData()
  }

  if (loading) {
    return <div className="loading">Loading questions...</div>
  }

  return (
    <div className="questions-page">
      <div className="page-header">
        <div>
          <h1>Questions</h1>
          {quiz && <p className="quiz-title">Quiz: {quiz.title}</p>}
        </div>
        <div className="header-actions">
          <button onClick={() => navigate(`/admin/quizzes/${id}`)} className="back-button">
            ← Back to Quiz
          </button>
          <button onClick={() => setShowAddForm(true)} className="add-question-button">
            + Add Question
          </button>
        </div>
      </div>

      {showAddForm && (
        <QuestionForm
          quizId={id!}
          onSave={handleSave}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="questions-list">
        {questions.length === 0 ? (
          <div className="empty-state">
            <p>No questions yet. Add your first question!</p>
          </div>
        ) : (
          questions.map((question) => (
            <div key={question.id} className="question-card">
              {editingId === question.id ? (
                <QuestionForm
                  quizId={id!}
                  question={question}
                  onSave={handleSave}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className="question-content">
                    <div className="question-header">
                      <span className="question-number">Question #{question.id}</span>
                      <span className="correct-badge">Correct: Option {question.correct_answer + 1}</span>
                    </div>
                    <div className="question-texts">
                      <div className="question-text">
                        <span className="lang-label">EN:</span>
                        <span className="text-content">{question.question_en}</span>
                      </div>
                      <div className="question-text">
                        <span className="lang-label">AR:</span>
                        <span className="text-content">{question.question_ar}</span>
                      </div>
                    </div>
                    <div className="question-options-grid">
                      <div className="options-column">
                        <h4>English Options</h4>
                        <div className="options-list">
                          {question.options_en.map((opt, idx) => (
                            <div
                              key={idx}
                              className={`option-item ${idx === question.correct_answer ? 'correct' : ''}`}
                            >
                              <span className="option-number">{idx + 1}.</span>
                              <span className="option-text">{opt}</span>
                              {idx === question.correct_answer && <span className="checkmark">✓</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="options-column">
                        <h4>Arabic Options</h4>
                        <div className="options-list">
                          {question.options_ar.map((opt, idx) => (
                            <div
                              key={idx}
                              className={`option-item ${idx === question.correct_answer ? 'correct' : ''}`}
                            >
                              <span className="option-number">{idx + 1}.</span>
                              <span className="option-text">{opt}</span>
                              {idx === question.correct_answer && <span className="checkmark">✓</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="question-actions">
                    <button onClick={() => setEditingId(question.id)} className="edit-button">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(question.id)} className="delete-button">
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

interface QuestionFormProps {
  quizId: string
  question?: Question
  onSave: () => void
  onCancel: () => void
}

function QuestionForm({ quizId, question, onSave, onCancel }: QuestionFormProps) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    question_en: question?.question_en || '',
    question_ar: question?.question_ar || '',
    options_en: question?.options_en || ['', '', '', ''],
    options_ar: question?.options_ar || ['', '', '', ''],
    correct_answer: question?.correct_answer ?? 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (question) {
        const { error } = await updateQuestion(question.id, formData)
        if (error) {
          alert('Error updating question: ' + error.message)
        } else {
          onSave()
        }
      } else {
        const { error } = await createQuestion({
          quiz_id: quizId,
          ...formData,
        })
        if (error) {
          alert('Error creating question: ' + error.message)
        } else {
          onSave()
        }
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const updateOption = (lang: 'en' | 'ar', index: number, value: string) => {
    const key = `options_${lang}` as 'options_en' | 'options_ar'
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].map((opt, i) => i === index ? value : opt)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="question-form">
      <div className="form-row">
        <div className="form-group">
          <label>Question (English) *</label>
          <textarea
            value={formData.question_en}
            onChange={(e) => setFormData(prev => ({ ...prev, question_en: e.target.value }))}
            required
            rows={3}
            className="question-textarea"
          />
        </div>
        <div className="form-group">
          <label>Question (Arabic) *</label>
          <textarea
            value={formData.question_ar}
            onChange={(e) => setFormData(prev => ({ ...prev, question_ar: e.target.value }))}
            required
            rows={3}
            className="question-textarea"
          />
        </div>
      </div>

      <div className="options-section">
        <h3>Options</h3>
        <div className="options-grid">
          {[0, 1, 2, 3].map((idx) => (
            <div key={idx} className="option-row">
              <div className="option-inputs">
                <div className="option-input-group">
                  <label>EN Option {idx + 1} *</label>
                  <input
                    type="text"
                    value={formData.options_en[idx]}
                    onChange={(e) => updateOption('en', idx, e.target.value)}
                    required
                    placeholder={`English option ${idx + 1}`}
                  />
                </div>
                <div className="option-input-group">
                  <label>AR Option {idx + 1} *</label>
                  <input
                    type="text"
                    value={formData.options_ar[idx]}
                    onChange={(e) => updateOption('ar', idx, e.target.value)}
                    required
                    placeholder={`الخيار ${idx + 1}`}
                  />
                </div>
              </div>
              <div className="correct-answer-selector">
                <input
                  type="radio"
                  name="correct_answer"
                  id={`correct-${idx}`}
                  checked={formData.correct_answer === idx}
                  onChange={() => setFormData(prev => ({ ...prev, correct_answer: idx }))}
                />
                <label htmlFor={`correct-${idx}`} className="correct-label">
                  Correct Answer
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-button">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="save-button">
          {saving ? 'Saving...' : question ? 'Update Question' : 'Create Question'}
        </button>
      </div>
    </form>
  )
}

