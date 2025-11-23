import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { QuizConfig, Score } from '../types'
import { useQuizConfig } from '../hooks/useQuizConfig'
import { subscribeToScores } from '../services/scoreService'
import './ScoreboardPage.css'

export default function ScoreboardPage() {
  const [searchParams] = useSearchParams()
  const quizId = searchParams.get('quiz') || null
  const { config, loading } = useQuizConfig(quizId)
  const [scores, setScores] = useState<Score[]>([])

  useEffect(() => {
    if (!quizId) return

    const unsubscribe = subscribeToScores(quizId, (updatedScores) => {
      setScores(updatedScores)
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [quizId])

  // Format time as MM:ss.mm
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const centiseconds = Math.floor((milliseconds % 1000) / 10)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
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
        Loading scoreboard...
      </div>
    )
  }

  // Get scoreboard background styling from config
  const gradientColor1 = config?.scoreboardGradientColor1 || '#667eea'
  const gradientColor2 = config?.scoreboardGradientColor2 || '#764ba2'
  const backgroundImageUrl = config?.scoreboardBackgroundImageUrl
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
    <div className="scoreboard-page" style={backgroundStyle}>
      {logoUrl && (
        <img 
          src={logoUrl} 
          alt="Logo" 
          className="scoreboard-logo"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
      <h1 className="scoreboard-title">Scoreboard</h1>
      <div className="scoreboard-container">
        {scores.length === 0 ? (
          <div className="no-scores">No scores yet. Be the first to play!</div>
        ) : (
          <table className="scoreboard-table">
            <thead style={{
              background: `linear-gradient(135deg, ${gradientColor1} 0%, ${gradientColor2} 100%)`
            }}>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Score</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score, index) => (
                <tr key={score.id} className={index < 3 ? `rank-${index + 1}` : ''}>
                  <td className="rank-cell">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index >= 3 && `#${index + 1}`}
                  </td>
                  <td className="player-cell">{score.player_name}</td>
                  <td className="score-cell">
                    {score.score} / {score.total_questions}
                  </td>
                  <td className="time-cell">{formatTime(score.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

