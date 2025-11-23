import { useState, useEffect } from 'react'
import { QuizConfig } from '../types'
import { getQuizConfig } from '../services/quizService'

export function useQuizConfig(quizId: string | null) {
  const [config, setConfig] = useState<QuizConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!quizId) {
      setLoading(false)
      return
    }

    async function fetchConfig() {
      try {
        setLoading(true)
        setError(null)
        const quizConfig = await getQuizConfig(quizId)
        if (quizConfig) {
          setConfig(quizConfig)
        } else {
          setError('Quiz not found')
        }
      } catch (err) {
        setError('Failed to load quiz configuration')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [quizId])

  return { config, loading, error }
}

