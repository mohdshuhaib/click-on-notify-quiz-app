import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function QuizSettingsHome() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {}
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  // Since it's a single quiz system, get the first one
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (quiz) {
    redirect(`/admin/quiz-settings/${quiz.id}/edit`)
  } else {
    // Create a default one if none exists
    const { data: newQuiz, error } = await supabase
      .from('quizzes')
      .insert({
        title: 'Click on Notify Mega Quiz',
        description: 'Welcome to the Mega Quiz Competition',
        time_limit: 30, // Default 30 mins
        is_published: false
      })
      .select('id')
      .single()

    if (newQuiz) {
      redirect(`/admin/quiz-settings/${newQuiz.id}/edit`)
    } else {
      return <div>Error initializing quiz.</div>
    }
  }
}
