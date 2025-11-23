import { useEffect, useState } from 'react'
import {
  getQuizQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion
} from '../../services/adminService'
import './QuestionManager.css'

interface Question {
  id: number
  quiz_id: string
  question_en: string
  question_ar: string
  options_en: string[]
  options_ar: string[]
  correct_answer: number
}

interface QuestionManagerProps {
  quizId: string
}

export default function QuestionManager({ quizId }: QuestionManagerProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    loadQuestions()
  }, [quizId])

  const loadQuestions = async () => {
    setLoading(true)
    const { data, error } = await getQuizQuestions(quizId)
    if (error) {
      console.error('Error loading questions:', error)
    } else {
      setQuestions(data || [])
    }
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
      loadQuestions()
    }
  }

  if (loading) {
    return <div className="loading">Loading questions...</div>
  }

  return (
    <div className="question-manager">
      <div className="question-manager-header">
        <h3>Questions ({questions.length})</h3>
        <button onClick={() => setShowAddForm(true)} className="add-question-button">
          + Add Question
        </button>
      </div>

      {showAddForm && (
        <QuestionForm
          quizId={quizId}
          onSave={() => {
            setShowAddForm(false)
            loadQuestions()
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="questions-list">
        {questions.map((question) => (
          <div key={question.id} className="question-card">
            {editingId === question.id ? (
              <QuestionForm
                quizId={quizId}
                question={question}
                onSave={() => {
                  setEditingId(null)
                  loadQuestions()
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                <div className="question-content">
                  <div className="question-text">
                    <strong>EN:</strong> {question.question_en}
                  </div>
                  <div className="question-text">
                    <strong>AR:</strong> {question.question_ar}
                  </div>
                  <div className="question-options">
                    <div>
                      <strong>Options (EN):</strong>
                      <ul>
                        {question.options_en.map((opt, idx) => (
                          <li key={idx} className={idx === question.correct_answer ? 'correct' : ''}>
                            {opt} {idx === question.correct_answer && '✓'}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Options (AR):</strong>
                      <ul>
                        {question.options_ar.map((opt, idx) => (
                          <li key={idx} className={idx === question.correct_answer ? 'correct' : ''}>
                            {opt} {idx === question.correct_answer && '✓'}
                          </li>
                        ))}
                      </ul>
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
        ))}
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
      <div className="form-group">
        <label>Question (English) *</label>
        <input
          type="text"
          value={formData.question_en}
          onChange={(e) => setFormData(prev => ({ ...prev, question_en: e.target.value }))}
          required
        />
      </div>
      <div className="form-group">
        <label>Question (Arabic) *</label>
        <input
          type="text"
          value={formData.question_ar}
          onChange={(e) => setFormData(prev => ({ ...prev, question_ar: e.target.value }))}
          required
        />
      </div>

      <div className="options-section">
        <div className="options-column">
          <label>Options (English) *</label>
          {[0, 1, 2, 3].map((idx) => (
            <div key={idx} className="option-input-group">
              <input
                type="text"
                value={formData.options_en[idx]}
                onChange={(e) => updateOption('en', idx, e.target.value)}
                required
                placeholder={`Option ${idx + 1}`}
              />
              <input
                type="radio"
                name="correct_answer"
                checked={formData.correct_answer === idx}
                onChange={() => setFormData(prev => ({ ...prev, correct_answer: idx }))}
              />
              <label>Correct</label>
            </div>
          ))}
        </div>
        <div className="options-column">
          <label>Options (Arabic) *</label>
          {[0, 1, 2, 3].map((idx) => (
            <div key={idx} className="option-input-group">
              <input
                type="text"
                value={formData.options_ar[idx]}
                onChange={(e) => updateOption('ar', idx, e.target.value)}
                required
                placeholder={`الخيار ${idx + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-button">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="save-button">
          {saving ? 'Saving...' : question ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}

