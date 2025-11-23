import { supabase } from '../lib/supabase'

export interface QuizFormData {
  id: string
  title: string
  background_image_path: string | null
  gradient_color_1: string
  gradient_color_2: string
  logo_path: string | null
  button_color_arabic: string
  button_color_english: string
  scoreboard_background_image_path: string | null
  scoreboard_gradient_color_1: string
  scoreboard_gradient_color_2: string
}

export async function getQuizzes() {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function getQuiz(quizId: string) {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .single()

  return { data, error }
}

export async function createQuiz(quizData: QuizFormData) {
  const { data, error } = await supabase
    .from('quizzes')
    .insert(quizData)
    .select()
    .single()

  return { data, error }
}

export async function updateQuiz(quizId: string, quizData: Partial<QuizFormData>) {
  const { data, error } = await supabase
    .from('quizzes')
    .update(quizData)
    .eq('id', quizId)
    .select()
    .single()

  return { data, error }
}

export async function deleteQuiz(quizId: string) {
  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', quizId)

  return { error }
}

export async function getQuizQuestions(quizId: string) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('id', { ascending: true })

  return { data, error }
}

export async function createQuestion(questionData: {
  quiz_id: string
  question_en: string
  question_ar: string
  options_en: string[]
  options_ar: string[]
  correct_answer: number
}) {
  const { data, error } = await supabase
    .from('questions')
    .insert(questionData)
    .select()
    .single()

  return { data, error }
}

export async function updateQuestion(questionId: number, questionData: Partial<{
  question_en: string
  question_ar: string
  options_en: string[]
  options_ar: string[]
  correct_answer: number
}>) {
  const { data, error } = await supabase
    .from('questions')
    .update(questionData)
    .eq('id', questionId)
    .select()
    .single()

  return { data, error }
}

export async function deleteQuestion(questionId: number) {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)

  return { error }
}

export async function uploadImage(file: File, bucket: 'quiz-backgrounds' | 'quiz-logos', path: string) {
  const { data: _data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) {
    return { data: null, error }
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return { data: urlData?.publicUrl, error: null }
}

export async function deleteImage(bucket: 'quiz-backgrounds' | 'quiz-logos', path: string) {
  // Remove bucket name if included
  let filePath = path
  if (filePath.startsWith(`${bucket}/`)) {
    filePath = filePath.replace(`${bucket}/`, '')
  }

  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath])

  return { error }
}

