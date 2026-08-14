import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, LogOut } from 'lucide-react'
import QuizDashboardCard from './components/QuizDashboardCard'

export default async function ParticipantDashboard() {
  const cookieStore = await cookies()
  const participantId = cookieStore.get('participant_token')?.value

  if (!participantId) {
    redirect('/login')
  }

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

  // Get participant details
  const { data: participant } = await supabase
    .from('participants')
    .select('*')
    .eq('id', participantId)
    .single()

  if (!participant) {
    redirect('/api/logout')
  }

  // Get the main active/published quiz
  const { data: mainQuiz } = await supabase
    .from('quizzes')
    .select('*')
    .eq('is_mock', false)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Get the mock active/published quiz
  const { data: mockQuiz } = await supabase
    .from('quizzes')
    .select('*')
    .eq('is_mock', true)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Check if participant already submitted main quiz
  let hasSubmittedMain = false
  if (mainQuiz) {
    const { data: submission } = await supabase
      .from('quiz_submissions')
      .select('id')
      .eq('quiz_id', mainQuiz.id)
      .eq('participant_id', participant.id)
      .maybeSingle()
    
    if (submission) {
      hasSubmittedMain = true
    }
  }

  // Check if participant already submitted mock quiz
  let hasSubmittedMock = false
  if (mockQuiz) {
    const { data: submission } = await supabase
      .from('quiz_submissions')
      .select('id')
      .eq('quiz_id', mockQuiz.id)
      .eq('participant_id', participant.id)
      .maybeSingle()
    
    if (submission) {
      hasSubmittedMock = true
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <nav className="w-full max-w-4xl flex justify-between items-center mb-8 bg-neu-bg p-4 rounded-2xl shadow-neu-flat">
        <h1 className="text-xl font-bold text-neu-text tracking-tight">Click on Notify</h1>
        
        {/* Logout via a Client Component or a simple form post, but for now we just link to a logout route or clear cookie client side */}
        <Link href="/api/logout" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neu-bg shadow-neu-flat text-neu-red font-semibold hover:shadow-neu-pressed transition-all text-sm">
          <LogOut className="w-4 h-4" /> Logout
        </Link>
      </nav>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-neu-bg rounded-[32px] p-8 shadow-neu-flat flex flex-col items-center space-y-4 h-fit">
          <div className="w-24 h-24 rounded-full bg-neu-bg shadow-neu-flat flex items-center justify-center text-neu-blue mb-2">
            <User className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-neu-text text-center">{participant.name}</h2>
          
          <div className="w-full space-y-3 pt-4 border-t border-slate-300/30">
            <div className="flex justify-between text-sm">
              <span className="text-neu-text-light font-medium">Reg ID</span>
              <span className="font-bold text-neu-text">{participant.reg_id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neu-text-light font-medium">District</span>
              <span className="font-bold text-neu-text">{participant.district}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neu-text-light font-medium">Phone</span>
              <span className="font-bold text-neu-text">{participant.phone}</span>
            </div>
          </div>
        </div>

        {/* Action / Quiz Card */}
        <div className="md:col-span-2 space-y-8">
          
          <div className="bg-neu-bg rounded-[32px] p-8 shadow-neu-flat flex flex-col justify-center border-2 border-neu-blue/10">
            <div className="space-y-2 mb-8">
              <h2 className="text-3xl font-bold text-neu-blue">Mock Test</h2>
              <p className="text-neu-text-light">Take a practice run to test the system before the main event.</p>
            </div>
            <QuizDashboardCard quiz={mockQuiz} hasSubmitted={hasSubmittedMock} />
          </div>

          <div className="bg-neu-bg rounded-[32px] p-8 shadow-neu-flat flex flex-col justify-center">
            <div className="space-y-2 mb-8">
              <h2 className="text-3xl font-bold text-neu-text">Mega Quiz Competition</h2>
              <p className="text-neu-text-light">Your assigned main quiz will appear here when ready.</p>
            </div>
            <QuizDashboardCard quiz={mainQuiz} hasSubmitted={hasSubmittedMain} />
          </div>

        </div>
      </div>
    </div>
  )
}
