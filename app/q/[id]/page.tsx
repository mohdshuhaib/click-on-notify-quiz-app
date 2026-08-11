import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPublicQuiz } from "./actions"
import QuizEngine from "./components/QuizEngine"
import QuizStatus from "./components/QuizStatus"

export default async function TakeQuizPage({
  params,
}: {
  params: Promise<{ id: string | string[] }>
}) {
  const resolvedParams = await params
  const quizId = Array.isArray(resolvedParams.id) ? resolvedParams.id[0] : resolvedParams.id

  const cookieStore = await cookies()
  const participantId = cookieStore.get('participant_token')?.value

  if (!participantId) {
    redirect('/login')
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: participant } = await supabase
    .from('participants')
    .select('*')
    .eq('id', participantId)
    .single()

  if (!participant) {
    redirect('/login')
  }

  // Check if already submitted
  const { data: submission } = await supabase
    .from('quiz_submissions')
    .select('id')
    .eq('quiz_id', quizId)
    .eq('participant_id', participant.id)
    .single()

  if (submission) {
    redirect('/dashboard')
  }

  const { status, quiz, questions, startTime, endTime, quizTitle } = await getPublicQuiz(quizId)

  if (status !== 'active') {
    return (
      <QuizStatus
        status={status as "unavailable" | "not_started" | "ended"}
        startTime={startTime}
        endTime={endTime}
        quizTitle={quizTitle}
      />
    )
  }

  return (
    <main className="min-h-screen bg-neu-bg">
      <QuizEngine quiz={quiz!} questions={questions!} participant={participant} />
    </main>
  )
}