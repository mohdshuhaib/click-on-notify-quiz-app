'use client'

import { useState, useEffect } from 'react'
import { FileText, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface Props {
  quiz: any | null;
  hasSubmitted: boolean;
}

export default function QuizDashboardCard({ quiz, hasSubmitted }: Props) {
  const [now, setNow] = useState(new Date())
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Update current time every second to power the real-time countdown
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!isMounted) {
    return (
      <div className="p-8 rounded-2xl bg-neu-bg shadow-neu-pressed-sm flex flex-col items-center justify-center space-y-6 min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-slate-300/10 animate-pulse" />
        <div className="h-6 w-32 bg-slate-300/10 rounded animate-pulse" />
        <div className="h-12 w-full max-w-xs bg-slate-300/10 rounded-xl animate-pulse mt-4" />
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="p-8 rounded-2xl bg-neu-bg shadow-neu-pressed-sm flex flex-col items-center justify-center space-y-6">
        <FileText className="w-16 h-16 text-neu-text-light opacity-50" />
        <div className="text-center">
          <h3 className="text-xl font-bold text-neu-text">Quiz Not Ready</h3>
          <p className="text-neu-text-light mt-2">The mega quiz is not active at the moment.</p>
        </div>
        <button disabled className="px-8 py-4 rounded-xl bg-neu-bg shadow-neu-flat opacity-50 cursor-not-allowed font-bold text-neu-text-light w-full max-w-xs">
          Waiting...
        </button>
      </div>
    )
  }

  if (hasSubmitted) {
    return (
      <div className="p-8 rounded-2xl bg-neu-bg shadow-neu-pressed-sm flex flex-col items-center justify-center space-y-6">
        <CheckCircle className="w-16 h-16 text-neu-green" />
        <div className="text-center">
          <h3 className="text-xl font-bold text-neu-text">Quiz Completed</h3>
          <p className="text-neu-text-light mt-2">You have successfully participated in this quiz.</p>
        </div>
        <button disabled className="px-8 py-4 rounded-xl bg-neu-bg shadow-neu-pressed-sm font-bold text-neu-green w-full max-w-xs flex items-center justify-center gap-2">
          <CheckCircle className="w-5 h-5" /> Done
        </button>
      </div>
    )
  }

  const startTime = quiz.start_time ? new Date(quiz.start_time) : null
  const endTime = quiz.end_time ? new Date(quiz.end_time) : null

  const hasStarted = !startTime || now >= startTime
  const hasEnded = endTime && now > endTime

  // Formatting helpers
  const formatTimeLeft = (target: Date) => {
    const diff = target.getTime() - now.getTime()
    if (diff <= 0) return '00:00:00'
    
    const h = Math.floor(diff / (1000 * 60 * 60))
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const s = Math.floor((diff % (1000 * 60)) / 1000)
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (hasEnded) {
    return (
      <div className="p-8 rounded-2xl bg-neu-bg shadow-neu-pressed-sm flex flex-col items-center justify-center space-y-6">
        <FileText className="w-16 h-16 text-neu-text-light opacity-50" />
        <div className="text-center">
          <h3 className="text-xl font-bold text-neu-text">Quiz Ended</h3>
          <p className="text-neu-text-light mt-2">This quiz has already concluded.</p>
        </div>
        <button disabled className="px-8 py-4 rounded-xl bg-neu-bg shadow-neu-flat opacity-50 cursor-not-allowed font-bold text-neu-text-light w-full max-w-xs">
          Closed
        </button>
      </div>
    )
  }

  if (!hasStarted && startTime) {
    return (
      <div className="p-8 rounded-2xl bg-neu-bg shadow-neu-pressed-sm flex flex-col items-center justify-center space-y-6">
        <Clock className="w-16 h-16 text-neu-blue animate-pulse" />
        <div className="text-center">
          <h3 className="text-xl font-bold text-neu-text">Starts Soon</h3>
          <p className="text-neu-text-light mt-2">
            Mega Quiz will start at <br/>
            <span className="font-bold text-neu-text">{startTime.toLocaleString()}</span>
          </p>
          <div className="mt-4 inline-block px-4 py-2 bg-neu-bg shadow-neu-pressed-sm rounded-xl font-mono text-xl text-neu-blue font-bold">
            {formatTimeLeft(startTime)}
          </div>
        </div>
        <button disabled className="px-8 py-4 rounded-xl bg-neu-bg shadow-neu-flat opacity-50 cursor-not-allowed font-bold text-neu-text-light w-full max-w-xs">
          Please wait...
        </button>
      </div>
    )
  }

  // Quiz is Active
  return (
    <div className="p-8 rounded-2xl bg-neu-bg shadow-neu-pressed-sm flex flex-col items-center justify-center space-y-6">
      <FileText className="w-16 h-16 text-neu-blue" />
      <div className="text-center">
        <h3 className="text-xl font-bold text-neu-text">{quiz.title}</h3>
        <p className="text-neu-text-light mt-2">{quiz.time_limit_seconds ? `${Math.floor(quiz.time_limit_seconds / 60)} Minutes` : 'No time limit'} • Good Luck!</p>
        
        {endTime && (
           <div className="mt-4 p-3 bg-neu-bg shadow-neu-pressed-sm rounded-xl border border-neu-red/20">
             <p className="text-xs font-bold text-neu-text-light uppercase tracking-wider mb-1">Time left to end</p>
             <p className="font-mono text-xl text-neu-red font-bold animate-pulse">
               {formatTimeLeft(endTime)}
             </p>
           </div>
        )}
      </div>
      <Link 
        href={`/q/${quiz.id}`}
        className="px-8 py-4 rounded-xl bg-neu-bg shadow-neu-flat text-neu-blue font-bold text-center w-full max-w-xs hover:shadow-neu-pressed transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        Get into Quiz
      </Link>
    </div>
  )
}
