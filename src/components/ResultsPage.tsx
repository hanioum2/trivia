import { useEffect, useRef } from 'react'
import { GameResult, QuizConfig } from '../types'
import { uploadScore } from '../services/scoreService'
import './ResultsPage.css'

interface ResultsPageProps {
  result: GameResult
  onGoHome: () => void
  config: QuizConfig | null
}

export default function ResultsPage({ result, onGoHome, config }: ResultsPageProps) {
  // Use ref to prevent duplicate uploads (React StrictMode causes double renders in dev)
  const hasUploaded = useRef(false)

  // Upload score to backend (only once)
  useEffect(() => {
    if (result.quizId && !hasUploaded.current) {
      hasUploaded.current = true
      uploadScore(result).catch((error) => {
        console.error('Failed to upload score:', error)
        // Reset on error so it can retry if needed
        hasUploaded.current = false
      })
    }
  }, [result])

  // Format timer as MM:ss.mm (same format as quiz page)
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const centiseconds = Math.floor((milliseconds % 1000) / 10)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
  }

  // Get background styling from config
  const gradientColor1 = config?.gradientColor1 || '#667eea'
  const gradientColor2 = config?.gradientColor2 || '#764ba2'
  const backgroundImageUrl = config?.backgroundImageUrl
  const logoUrl = config?.logoUrl
  const buttonColorArabic = config?.buttonColorArabic || '#10b981'
  const scorePercentage = Math.round((result.score / result.totalQuestions) * 100)

  const backgroundStyle = backgroundImageUrl
    ? {
        backgroundImage: `linear-gradient(135deg, ${gradientColor1} 0%, ${gradientColor2} 100%), url(${backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
      }
    : {
        background: `linear-gradient(135deg, ${gradientColor1} 0%, ${gradientColor2} 100%)`,
      }

  // Always use birthday hat with confetti emoji
  const celebrationEmoji = '🎉'

  return (
    <div className="results-page" style={backgroundStyle}>
      {logoUrl && (
        <img 
          src={logoUrl} 
          alt="Logo" 
          className="results-logo"
          onError={(e) => {
            console.error('Failed to load logo from:', logoUrl)
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
      <div className="results-container">
        <div className="results-title-wrapper">
          <h1 className="results-title">Congratulations</h1>
          <div className="celebration-emoji">{celebrationEmoji}</div>
        </div>
        <div className="results-content">
          <div className="result-item result-item-animated">
            <span className="result-label">Player:</span>
            <span className="result-value">{result.playerName}</span>
          </div>
          <div className="result-item result-item-animated">
            <span className="result-label">Score:</span>
            <span className="result-value score-highlight">
              {result.score} / {result.totalQuestions} ({scorePercentage}%)
            </span>
          </div>
          <div className="result-item result-item-animated">
            <span className="result-label">Time:</span>
            <span className="result-value">{formatTime(result.time)}</span>
          </div>
        </div>
        <button 
          className="home-button" 
          onClick={onGoHome}
          style={{ background: buttonColorArabic }}
        >
          Go Home
        </button>
      </div>
    </div>
  )
}

