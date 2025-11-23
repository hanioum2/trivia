import { useState } from 'react'
import { Language, QuizConfig } from '../types'
import './StartPage.css'

interface StartPageProps {
  onStart: (name: string, language: Language) => void
  config: QuizConfig | null
}

export default function StartPage({ onStart, config }: StartPageProps) {
  const [name, setName] = useState('')

  const handleStart = (language: Language) => {
    if (name.trim()) {
      onStart(name.trim(), language)
    }
  }

  // Default values if config is not loaded
  const title = config?.title || 'Speed Trivia'
  const gradientColor1 = config?.gradientColor1 || '#667eea'
  const gradientColor2 = config?.gradientColor2 || '#764ba2'
  const buttonColorArabic = config?.buttonColorArabic || '#10b981'
  const buttonColorEnglish = config?.buttonColorEnglish || '#3b82f6'
  const backgroundImageUrl = config?.backgroundImageUrl
  const logoUrl = config?.logoUrl

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

  return (
    <div className="start-page" style={backgroundStyle}>
      {logoUrl && (
        <img 
          src={logoUrl} 
          alt="Logo" 
          className="start-logo"
          onError={(e) => {
            console.error('Failed to load logo from:', logoUrl)
            // Hide logo if it fails to load
            e.currentTarget.style.display = 'none'
          }}
          onLoad={() => {
            console.log('Logo loaded successfully from:', logoUrl)
          }}
        />
      )}
      <div className="start-container">
        <h1 className="start-title">{title}</h1>
        <input
          type="text"
          className="name-input"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && name.trim()) {
              handleStart('en')
            }
          }}
          autoFocus
        />
        <div className="button-group">
          <button
            className="start-button start-button-arabic"
            style={{ background: buttonColorArabic }}
            onClick={() => handleStart('ar')}
            disabled={!name.trim()}
          >
            ابدأ بالعربية
          </button>
          <button
            className="start-button start-button-english"
            style={{ background: buttonColorEnglish }}
            onClick={() => handleStart('en')}
            disabled={!name.trim()}
          >
            Start in English
          </button>
        </div>
      </div>
    </div>
  )
}

