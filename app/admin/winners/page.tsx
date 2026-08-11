import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Trophy, ArrowLeft, Download } from 'lucide-react'

export default async function WinnersPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  // Fetch the first quiz
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id, title')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  let submissions: any[] = []

  if (quiz) {
    const { data } = await supabase
      .from('quiz_submissions')
      .select('score, total_points, time_taken_seconds, cheat_warnings, submitted_at, participants(name, reg_id, place, district)')
      .eq('quiz_id', quiz.id)
      .order('score', { ascending: false })
      .order('time_taken_seconds', { ascending: true })
      
    if (data) submissions = data
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-neu-bg p-6 rounded-[32px] shadow-neu-flat">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="p-3 rounded-xl bg-neu-bg shadow-neu-flat hover:shadow-neu-pressed transition-all text-neu-text">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-neu-text">Winners & Results</h1>
              <p className="text-sm text-neu-text-light">{quiz ? quiz.title : 'No quiz found'}</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-neu-bg shadow-neu-pressed-sm flex items-center justify-center text-neu-blue">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-neu-bg rounded-[32px] p-6 shadow-neu-flat overflow-hidden">
          {submissions.length === 0 ? (
            <div className="text-center py-16 text-neu-text-light">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-neu-text mb-2">No Results Yet</h3>
              <p>When participants complete the quiz, their scores will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 text-xs font-bold text-neu-text-light uppercase tracking-wider border-b-2 border-slate-300/30 w-16 text-center">Rank</th>
                    <th className="p-4 text-xs font-bold text-neu-text-light uppercase tracking-wider border-b-2 border-slate-300/30">Participant</th>
                    <th className="p-4 text-xs font-bold text-neu-text-light uppercase tracking-wider border-b-2 border-slate-300/30">Location</th>
                    <th className="p-4 text-xs font-bold text-neu-text-light uppercase tracking-wider border-b-2 border-slate-300/30">Score</th>
                    <th className="p-4 text-xs font-bold text-neu-text-light uppercase tracking-wider border-b-2 border-slate-300/30">Time Taken</th>
                    <th className="p-4 text-xs font-bold text-neu-text-light uppercase tracking-wider border-b-2 border-slate-300/30">Warnings</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {submissions.map((sub, idx) => (
                    <tr key={idx} className="border-b border-slate-300/10 hover:bg-slate-300/5 transition-colors">
                      <td className="p-4 text-center">
                        {idx === 0 ? <span className="inline-block w-8 h-8 rounded-full bg-yellow-400 text-white font-bold leading-8 shadow-sm">1</span> :
                         idx === 1 ? <span className="inline-block w-8 h-8 rounded-full bg-slate-300 text-slate-700 font-bold leading-8 shadow-sm">2</span> :
                         idx === 2 ? <span className="inline-block w-8 h-8 rounded-full bg-amber-600 text-white font-bold leading-8 shadow-sm">3</span> :
                         <span className="font-bold text-neu-text-light">{idx + 1}</span>}
                      </td>
                      <td className="p-4 font-semibold text-neu-text">
                        {sub.participants.name}
                        <br/><span className="text-xs text-neu-text-light font-normal">ID: {sub.participants.reg_id}</span>
                      </td>
                      <td className="p-4 text-neu-text">
                        {sub.participants.place}, {sub.participants.district}
                      </td>
                      <td className="p-4 font-bold text-neu-blue text-lg">
                        {sub.score} <span className="text-sm text-neu-text-light">/ {sub.total_points}</span>
                      </td>
                      <td className="p-4 text-neu-text-light">
                        {sub.time_taken_seconds ? `${Math.floor(sub.time_taken_seconds / 60)}m ${sub.time_taken_seconds % 60}s` : '-'}
                      </td>
                      <td className="p-4">
                        {sub.cheat_warnings > 0 ? (
                          <span className="px-2 py-1 bg-neu-bg shadow-neu-pressed-sm rounded text-xs font-bold text-neu-red">
                            {sub.cheat_warnings}
                          </span>
                        ) : (
                          <span className="text-neu-text-light">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}