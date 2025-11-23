import { useState, useEffect, useMemo } from 'react'
import { Language, Question, GameResult, QuizConfig } from '../types'
import { useQuizQuestions } from '../hooks/useQuizQuestions'
import questionsData from '../data/questions.json' // Fallback
import './QuizPage.css'

interface QuizPageProps {
  playerName: string
  language: Language
  onComplete: (result: GameResult) => void
  config: QuizConfig | null
  quizId: string | null
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

interface ShuffledQuestion extends Question {
  shuffledOptions: string[]
  correctAnswerIndex: number // Index in the shuffled options array
}

export default function QuizPage({ playerName, language, onComplete, config, quizId }: QuizPageProps) {
  // Fetch questions from backend or use fallback
  const { questions: backendQuestions, loading: questionsLoading } = useQuizQuestions(quizId)
  
  // Use backend questions if available, otherwise fall back to local data
  const questionsToUse = backendQuestions.length > 0 ? backendQuestions : (questionsData as Question[])

  // Shuffle questions and options on component mount
  const shuffledQuestions = useMemo<ShuffledQuestion[]>(() => {
    if (questionsToUse.length === 0) return []
    const shuffled = shuffleArray(questionsToUse)
    return shuffled.map((question) => {
      const options = question.options[language]
      const shuffledOptions = shuffleArray(options)
      // Find the correct answer index in the shuffled array
      const correctAnswerIndex = shuffledOptions.findIndex(
        (option) => option === options[question.correctAnswer]
      )
      return {
        ...question,
        shuffledOptions,
        correctAnswerIndex,
      }
    })
  }, [questionsToUse, language])

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [countdown, setCountdown] = useState<number | null>(3)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [isPreloading, setIsPreloading] = useState(true)
  const [timeElapsed, setTimeElapsed] = useState(0) // in milliseconds

  useEffect(() => {
    // Wait for questions to load before starting
    if (questionsLoading) {
      setIsPreloading(true)
      return
    }

    if (questionsToUse.length === 0) {
      setIsPreloading(true)
      return
    }

    // Preload questions (simulate preloading)
    const preloadTimer = setTimeout(() => {
      setIsPreloading(false)
    }, 500)

    return () => clearTimeout(preloadTimer)
  }, [questionsLoading, questionsToUse])

  useEffect(() => {
    if (isPreloading) return

    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      setCountdown(null)
      setStartTime(Date.now())
    }
  }, [countdown, isPreloading])

  useEffect(() => {
    if (startTime === null) return

    const timer = setInterval(() => {
      setTimeElapsed(Date.now() - startTime)
    }, 10) // Update every 10ms for millisecond precision

    return () => clearInterval(timer)
  }, [startTime])

  const handleAnswer = (selectedIndex: number) => {
    if (startTime === null) return

    const currentQuestion = shuffledQuestions[currentQuestionIndex]
    const isCorrect = selectedIndex === currentQuestion.correctAnswerIndex
    const newScore = isCorrect ? score + 1 : score

    if (isCorrect) {
      setScore(newScore)
    }

    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Quiz complete
      const endTime = Date.now()
      const totalTime = endTime - startTime
      const result: GameResult = {
        playerName,
        score: newScore,
        totalQuestions: shuffledQuestions.length,
        time: totalTime,
        language,
        timestamp: Date.now()
      }
      onComplete(result)
    }
  }

  // Get background styling from config
  const gradientColor1 = config?.gradientColor1 || '#667eea'
  const gradientColor2 = config?.gradientColor2 || '#764ba2'
  const backgroundImageUrl = config?.backgroundImageUrl
  const buttonColorArabic = config?.buttonColorArabic || '#10b981'

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

  const logoUrl = config?.logoUrl

  if (isPreloading || questionsLoading || shuffledQuestions.length === 0) {
    return (
      <div className="quiz-page" style={backgroundStyle}>
        {logoUrl && (
          <img 
            src={logoUrl} 
            alt="Logo" 
            className="quiz-logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        )}
        <div className="preloading">
          {questionsLoading ? 'Loading questions...' : shuffledQuestions.length === 0 ? 'No questions available' : 'Preparing quiz...'}
        </div>
      </div>
    )
  }

  if (countdown !== null) {
    return (
      <div className="quiz-page" style={backgroundStyle}>
        {logoUrl && (
          <img 
            src={logoUrl} 
            alt="Logo" 
            className="quiz-logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        )}
        <div className="countdown">{countdown}</div>
      </div>
    )
  }

  // Format timer as MM:ss.mm
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const centiseconds = Math.floor((milliseconds % 1000) / 10)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex]

  return (
    <div className="quiz-page" style={backgroundStyle}>
      {logoUrl && (
        <img 
          src={logoUrl} 
          alt="Logo" 
          className="quiz-logo"
          onError={(e) => {
            console.error('Failed to load logo from:', logoUrl)
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
      <div className={`quiz-header ${logoUrl ? 'with-logo' : ''}`}>
        <div className="timer">Time: {formatTime(timeElapsed)}</div>
        <div className="question-counter">
          {currentQuestionIndex + 1} / {shuffledQuestions.length}
        </div>
      </div>
      <div className="question-container">
        <h2 
          className="question-text"
          dir={language === 'ar' ? 'rtl' : 'ltr'}
          style={{ color: buttonColorArabic }}
        >
          {currentQuestion.question[language]}
        </h2>
        <div className="options-container">
          {currentQuestion.shuffledOptions.map((option, index) => (
            <button
              key={index}
              className="option-button"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              onClick={() => handleAnswer(index)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

