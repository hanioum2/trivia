import { supabase } from '../lib/supabase'
import { GameResult, Score } from '../types'

export async function uploadScore(result: GameResult): Promise<boolean> {
  try {
    if (!result.quizId) {
      console.warn('No quiz ID provided, skipping score upload')
      return false
    }

    const { error } = await supabase
      .from('scores')
      .insert({
        quiz_id: result.quizId,
        player_name: result.playerName,
        score: result.score,
        total_questions: result.totalQuestions,
        time: result.time,
        language: result.language,
      })

    if (error) {
      console.error('Error uploading score:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in uploadScore:', error)
    return false
  }
}

export function subscribeToScores(
  quizId: string,
  callback: (scores: Score[]) => void
) {
  // Initial fetch
  fetchScores(quizId).then(callback)

  // Subscribe to realtime changes
  const channel = supabase
    .channel(`scores:${quizId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'scores',
        filter: `quiz_id=eq.${quizId}`,
      },
      () => {
        // Refetch scores when changes occur
        fetchScores(quizId).then(callback)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export async function fetchScores(quizId: string): Promise<Score[]> {
  try {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('quiz_id', quizId)
      .order('score', { ascending: false })
      .order('time', { ascending: true })
      .limit(10)

    if (error) {
      console.error('Error fetching scores:', error)
      return []
    }

    return (data || []) as Score[]
  } catch (error) {
    console.error('Error in fetchScores:', error)
    return []
  }
}

