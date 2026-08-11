import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, LogOut, FileText, CheckCircle } from 'lucide-react'

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
    redirect('/login')
  }

  // Get the single active/published quiz
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Check if participant already submitted
  let hasSubmitted = false
  if (quiz) {
    const { data: submission } = await supabase
      .from('quiz_submissions')
      .select('id')
      .eq('quiz_id', quiz.id)
      .eq('participant_id', participant.id)
      .single()
    
    if (submission) {
      hasSubmitted = true
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
        <div className="md:col-span-1 bg-neu-bg rounded-[32px] p-8 shadow-neu-flat flex flex-col items-center space-y-4">
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
        <div className="md:col-span-2 bg-neu-bg rounded-[32px] p-8 shadow-neu-flat flex flex-col justify-center">
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-neu-text">Mega Quiz Competition</h2>
            <p className="text-neu-text-light">Your assigned quiz will appear here when ready.</p>
          </div>

          <div className="p-8 rounded-2xl bg-neu-bg shadow-neu-pressed-sm flex flex-col items-center justify-center space-y-6">
            {!quiz ? (
              <>
                <FileText className="w-16 h-16 text-neu-text-light opacity-50" />
                <div className="text-center">
                  <h3 className="text-xl font-bold text-neu-text">Quiz Starts Soon</h3>
                  <p className="text-neu-text-light mt-2">The admin has not published the quiz yet. Please wait.</p>
                </div>
                <button disabled className="px-8 py-4 rounded-xl bg-neu-bg shadow-neu-flat opacity-50 cursor-not-allowed font-bold text-neu-text-light w-full max-w-xs">
                  Waiting...
                </button>
              </>
            ) : hasSubmitted ? (
              <>
                <CheckCircle className="w-16 h-16 text-neu-green" />
                <div className="text-center">
                  <h3 className="text-xl font-bold text-neu-text">Quiz Completed</h3>
                  <p className="text-neu-text-light mt-2">You have successfully participated in this quiz.</p>
                </div>
                <button disabled className="px-8 py-4 rounded-xl bg-neu-bg shadow-neu-pressed-sm font-bold text-neu-green w-full max-w-xs flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Done
                </button>
              </>
            ) : (
              <>
                <FileText className="w-16 h-16 text-neu-blue" />
                <div className="text-center">
                  <h3 className="text-xl font-bold text-neu-text">{quiz.title}</h3>
                  <p className="text-neu-text-light mt-2">{quiz.time_limit ? `${quiz.time_limit} Minutes` : 'No time limit'} • Good Luck!</p>
                </div>
                <Link 
                  href={`/q/${quiz.id}`}
                  className="px-8 py-4 rounded-xl bg-neu-bg shadow-neu-flat text-neu-blue font-bold text-center w-full max-w-xs hover:shadow-neu-pressed transition-all active:scale-95"
                >
                  Start Quiz Now
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
