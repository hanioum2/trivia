import { useState, useEffect } from 'react'
import { Question } from '../types'
import { getQuizQuestions } from '../services/quizService'

export function useQuizQuestions(quizId: string | null) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!quizId) {
      setLoading(false)
      return
    }

    async function fetchQuestions() {
      try {
        setLoading(true)
        setError(null)
        if (!quizId) return
        const quizQuestions = await getQuizQuestions(quizId)
        if (quizQuestions && quizQuestions.length > 0) {
          setQuestions(quizQuestions)
        } else {
          setError('No questions found for this quiz')
        }
      } catch (err) {
        setError('Failed to load questions')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [quizId])

  return { questions, loading, error }
}

