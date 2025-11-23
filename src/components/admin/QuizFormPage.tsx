import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getQuiz,
  createQuiz,
  updateQuiz,
  uploadImage,
  QuizFormData
} from '../../services/adminService'
import './QuizFormPage.css'

export default function QuizFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<QuizFormData>({
    id: '',
    title: '',
    background_image_path: null,
    gradient_color_1: '#667eea',
    gradient_color_2: '#764ba2',
    logo_path: null,
    button_color_arabic: '#10b981',
    button_color_english: '#3b82f6',
    scoreboard_background_image_path: null,
    scoreboard_gradient_color_1: '#667eea',
    scoreboard_gradient_color_2: '#764ba2',
    scoreboard_logo_path: null,
  })

  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [scoreboardBackgroundImageFile, setScoreboardBackgroundImageFile] = useState<File | null>(null)
  const [scoreboardLogoFile, setScoreboardLogoFile] = useState<File | null>(null)

  useEffect(() => {
    if (isEdit && id) {
      loadQuiz(id)
    } else {
      setLoading(false)
    }
  }, [id, isEdit])

  const loadQuiz = async (quizId: string) => {
    setLoading(true)
    const { data, error } = await getQuiz(quizId)
    if (error) {
      alert('Error loading quiz: ' + error.message)
      navigate('/admin/quizzes')
    } else if (data) {
      setFormData(data)
    }
    setLoading(false)
  }

  const handleInputChange = (field: keyof QuizFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (
    file: File,
    bucket: 'quiz-backgrounds' | 'quiz-logos',
    field: 'background_image_path' | 'logo_path' | 'scoreboard_background_image_path' | 'scoreboard_logo_path'
  ) => {
    const fileName = `${Date.now()}-${file.name}`
    const { error } = await uploadImage(file, bucket, fileName)
    
    if (error) {
      alert('Error uploading image: ' + error.message)
      return false
    }

    handleInputChange(field, fileName)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Upload images first
      if (backgroundImageFile) {
        await handleImageUpload(backgroundImageFile, 'quiz-backgrounds', 'background_image_path')
      }
      if (logoFile) {
        await handleImageUpload(logoFile, 'quiz-logos', 'logo_path')
      }
      if (scoreboardBackgroundImageFile) {
        await handleImageUpload(scoreboardBackgroundImageFile, 'quiz-backgrounds', 'scoreboard_background_image_path')
      }
      if (scoreboardLogoFile) {
        await handleImageUpload(scoreboardLogoFile, 'quiz-logos', 'scoreboard_logo_path')
      }

      // Save quiz
      if (isEdit && id) {
        const { error } = await updateQuiz(id, formData)
        if (error) {
          alert('Error updating quiz: ' + error.message)
        } else {
          navigate('/admin/quizzes')
        }
      } else {
        const { error } = await createQuiz(formData)
        if (error) {
          alert('Error creating quiz: ' + error.message)
        } else {
          navigate('/admin/quizzes')
        }
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading quiz...</div>
  }

  return (
    <div className="quiz-form-page">
      <div className="page-header">
        <h1>{isEdit ? 'Edit Quiz' : 'Create New Quiz'}</h1>
        <button onClick={() => navigate('/admin/quizzes')} className="back-button">
          ← Back to Quizzes
        </button>
      </div>

      <form onSubmit={handleSubmit} className="quiz-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-group">
            <label>Quiz ID *</label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => handleInputChange('id', e.target.value)}
              required
              disabled={isEdit}
              placeholder="e.g., quiz-1"
            />
            {isEdit && <small>Quiz ID cannot be changed</small>}
          </div>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              placeholder="Quiz Title"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Game Background</h2>
          <div className="form-group">
            <label>Background Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBackgroundImageFile(e.target.files?.[0] || null)}
            />
            {formData.background_image_path && (
              <small>Current: {formData.background_image_path}</small>
            )}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Gradient Color 1 (Top-Left)</label>
              <input
                type="color"
                value={formData.gradient_color_1}
                onChange={(e) => handleInputChange('gradient_color_1', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Gradient Color 2 (Bottom-Right)</label>
              <input
                type="color"
                value={formData.gradient_color_2}
                onChange={(e) => handleInputChange('gradient_color_2', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Logo</h2>
          <div className="form-group">
            <label>Logo Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
            />
            {formData.logo_path && (
              <small>Current: {formData.logo_path}</small>
            )}
          </div>
        </div>

        <div className="form-section">
          <h2>Button Colors</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Arabic Button Color</label>
              <input
                type="color"
                value={formData.button_color_arabic}
                onChange={(e) => handleInputChange('button_color_arabic', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>English Button Color</label>
              <input
                type="color"
                value={formData.button_color_english}
                onChange={(e) => handleInputChange('button_color_english', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Scoreboard Background</h2>
          <div className="form-group">
            <label>Background Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setScoreboardBackgroundImageFile(e.target.files?.[0] || null)}
            />
            {formData.scoreboard_background_image_path && (
              <small>Current: {formData.scoreboard_background_image_path}</small>
            )}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Gradient Color 1 (Top-Left)</label>
              <input
                type="color"
                value={formData.scoreboard_gradient_color_1}
                onChange={(e) => handleInputChange('scoreboard_gradient_color_1', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Gradient Color 2 (Bottom-Right)</label>
              <input
                type="color"
                value={formData.scoreboard_gradient_color_2}
                onChange={(e) => handleInputChange('scoreboard_gradient_color_2', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Scoreboard Logo</h2>
          <div className="form-group">
            <label>Logo Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setScoreboardLogoFile(e.target.files?.[0] || null)}
            />
            {formData.scoreboard_logo_path && (
              <small>Current: {formData.scoreboard_logo_path}</small>
            )}
          </div>
        </div>

        {isEdit && id && (
          <div className="form-section">
            <h2>Questions</h2>
            <div className="questions-section">
              <p>Manage questions for this quiz separately.</p>
              <button
                type="button"
                onClick={() => navigate(`/admin/quizzes/${id}/questions`)}
                className="manage-questions-button"
              >
                Manage Questions →
              </button>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/quizzes')} className="cancel-button">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="save-button">
            {saving ? 'Saving...' : isEdit ? 'Update Quiz' : 'Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  )
}

