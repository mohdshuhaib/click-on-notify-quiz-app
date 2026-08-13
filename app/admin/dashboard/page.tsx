import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Users, Settings, Trophy, LogOut, Activity, HardDrive } from 'lucide-react'
import { adminLogout } from '../logout-action'

export default async function AdminDashboard() {
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

  // Fetch metrics
  const { count: participantsCount } = await supabase
    .from('participants')
    .select('*', { count: 'exact', head: true })

  const { count: submissionsCount } = await supabase
    .from('quiz_submissions')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <nav className="w-full max-w-5xl flex justify-between items-center mb-8 bg-neu-bg p-4 rounded-2xl shadow-neu-flat">
        <h1 className="text-xl font-bold text-neu-text tracking-tight">Admin Dashboard</h1>
        
        <form action={adminLogout}>
          <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neu-bg shadow-neu-flat text-neu-red font-semibold hover:shadow-neu-pressed transition-all text-sm">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </form>
      </nav>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Metric Card 1 */}
        <div className="bg-neu-bg rounded-3xl p-8 shadow-neu-flat flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-neu-text-light font-bold uppercase tracking-wider text-sm">Total Participants</h2>
            <p className="text-5xl font-black text-neu-text">{participantsCount || 0}</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-neu-bg shadow-neu-pressed-sm flex items-center justify-center text-neu-blue">
            <Users className="w-8 h-8" />
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-neu-bg rounded-3xl p-8 shadow-neu-flat flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-neu-text-light font-bold uppercase tracking-wider text-sm">Total Submissions</h2>
            <p className="text-5xl font-black text-neu-text">{submissionsCount || 0}</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-neu-bg shadow-neu-pressed-sm flex items-center justify-center text-neu-green">
            <Activity className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Navigation Cards */}
        <Link href="/admin/participants" className="group bg-neu-bg rounded-3xl p-8 shadow-neu-flat flex flex-col items-center justify-center text-center space-y-4 hover:shadow-neu-pressed transition-all">
          <div className="w-16 h-16 rounded-full bg-neu-bg shadow-neu-flat group-hover:shadow-neu-pressed-sm flex items-center justify-center text-neu-blue transition-all">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neu-text">Participant List</h3>
            <p className="text-sm text-neu-text-light mt-1">View and manage users</p>
          </div>
        </Link>

        <Link href="/admin/quiz-settings" className="group bg-neu-bg rounded-3xl p-8 shadow-neu-flat flex flex-col items-center justify-center text-center space-y-4 hover:shadow-neu-pressed transition-all">
          <div className="w-16 h-16 rounded-full bg-neu-bg shadow-neu-flat group-hover:shadow-neu-pressed-sm flex items-center justify-center text-neu-blue transition-all">
            <Settings className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neu-text">Quiz Settings</h3>
            <p className="text-sm text-neu-text-light mt-1">Manage questions & access</p>
          </div>
        </Link>

        <Link href="/admin/winners" className="group bg-neu-bg rounded-3xl p-8 shadow-neu-flat flex flex-col items-center justify-center text-center space-y-4 hover:shadow-neu-pressed transition-all">
          <div className="w-16 h-16 rounded-full bg-neu-bg shadow-neu-flat group-hover:shadow-neu-pressed-sm flex items-center justify-center text-neu-blue transition-all">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neu-text">Winners & Results</h3>
            <p className="text-sm text-neu-text-light mt-1">View leaderboard</p>
          </div>
        </Link>

        <Link href="/admin/general-settings" className="group bg-neu-bg rounded-3xl p-8 shadow-neu-flat flex flex-col items-center justify-center text-center space-y-4 hover:shadow-neu-pressed transition-all">
          <div className="w-16 h-16 rounded-full bg-neu-bg shadow-neu-flat group-hover:shadow-neu-pressed-sm flex items-center justify-center text-neu-red transition-all">
            <HardDrive className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neu-text">General Settings</h3>
            <p className="text-sm text-neu-text-light mt-1">Database resets & config</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
