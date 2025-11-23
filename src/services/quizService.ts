import { supabase } from '../lib/supabase'
import { QuizConfig, Question } from '../types'

export async function getQuizQuestions(quizId: string): Promise<Question[] | null> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching questions:', error)
      return null
    }

    if (!data || data.length === 0) {
      return null
    }

    // Transform database format to Question interface
    return data.map((q) => ({
      id: q.id,
      question: {
        en: q.question_en,
        ar: q.question_ar,
      },
      options: {
        en: q.options_en || [],
        ar: q.options_ar || [],
      },
      correctAnswer: q.correct_answer,
    }))
  } catch (error) {
    console.error('Error in getQuizQuestions:', error)
    return null
  }
}

export async function getQuizConfig(quizId: string): Promise<QuizConfig | null> {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single()

    if (error) {
      console.error('Error fetching quiz config:', error)
      return null
    }

    if (!data) {
      return null
    }

    // Get background image URL from storage if it exists
    let backgroundImageUrl: string | null = null
    if (data.background_image_path) {
      // Remove bucket name from path if included
      let imagePath = data.background_image_path
      if (imagePath.startsWith('quiz-backgrounds/')) {
        imagePath = imagePath.replace('quiz-backgrounds/', '')
      }
      
      const { data: imageData } = supabase.storage
        .from('quiz-backgrounds')
        .getPublicUrl(imagePath)
      backgroundImageUrl = imageData?.publicUrl || null
      console.log('Background URL generated:', backgroundImageUrl, 'from path:', data.background_image_path)
    }

    // Get logo URL from storage if it exists
    let logoUrl: string | null = null
    if (data.logo_path) {
      // Remove bucket name from path if included (e.g., 'quiz-logos/sf_logo.jpg' -> 'sf_logo.jpg')
      let logoPath = data.logo_path
      if (logoPath.startsWith('quiz-logos/')) {
        logoPath = logoPath.replace('quiz-logos/', '')
      }
      
      const { data: logoData } = supabase.storage
        .from('quiz-logos')
        .getPublicUrl(logoPath)
      logoUrl = logoData?.publicUrl || null
      console.log('Logo URL generated:', logoUrl, 'from path:', data.logo_path)
    }

    // Get scoreboard background image URL from storage if it exists
    let scoreboardBackgroundImageUrl: string | null = null
    if (data.scoreboard_background_image_path) {
      let imagePath = data.scoreboard_background_image_path
      if (imagePath.startsWith('quiz-backgrounds/')) {
        imagePath = imagePath.replace('quiz-backgrounds/', '')
      }
      
      const { data: imageData } = supabase.storage
        .from('quiz-backgrounds')
        .getPublicUrl(imagePath)
      scoreboardBackgroundImageUrl = imageData?.publicUrl || null
    }

    // Get scoreboard logo URL from storage if it exists
    let scoreboardLogoUrl: string | null = null
    if (data.scoreboard_logo_path) {
      // Remove bucket name from path if included
      let logoPath = data.scoreboard_logo_path
      if (logoPath.startsWith('quiz-logos/')) {
        logoPath = logoPath.replace('quiz-logos/', '')
      }
      
      const { data: logoData } = supabase.storage
        .from('quiz-logos')
        .getPublicUrl(logoPath)
      scoreboardLogoUrl = logoData?.publicUrl || null
    }

    return {
      id: data.id,
      title: data.title,
      backgroundImageUrl,
      gradientColor1: data.gradient_color_1 || '#667eea',
      gradientColor2: data.gradient_color_2 || '#764ba2',
      logoUrl,
      buttonColorArabic: data.button_color_arabic || '#10b981',
      buttonColorEnglish: data.button_color_english || '#3b82f6',
      scoreboardBackgroundImageUrl,
      scoreboardGradientColor1: data.scoreboard_gradient_color_1 || '#667eea',
      scoreboardGradientColor2: data.scoreboard_gradient_color_2 || '#764ba2',
      scoreboardLogoUrl,
    }
  } catch (error) {
    console.error('Error in getQuizConfig:', error)
    return null
  }
}

