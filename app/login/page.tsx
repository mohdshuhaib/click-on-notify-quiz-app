'use client'

import { useState } from 'react'
import { loginParticipant } from './actions'
import Link from 'next/link'
import { Loader2, KeyRound } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    try {
      const res = await loginParticipant(formData)
      if (res && !res.success) {
        setError(res.error || 'Login failed')
        setLoading(false)
      }
      // If success, next/navigation redirect will trigger and we don't need to unset loading immediately
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-neu-bg rounded-[32px] p-8 shadow-neu-flat">
        <div className="text-center mb-8 space-y-2">
          <div className="w-16 h-16 bg-neu-bg rounded-full shadow-neu-flat flex items-center justify-center mx-auto mb-4 text-neu-blue">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-neu-text">Participant Login</h1>
          <p className="text-neu-text-light font-medium">Enter your credentials to continue</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-neu-bg shadow-neu-pressed-sm border border-neu-red/20 text-neu-red text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neu-text ml-2">Registration ID</label>
            <input 
              required 
              name="reg_id" 
              type="text" 
              className="w-full p-4 rounded-2xl bg-neu-bg shadow-neu-pressed-sm text-neu-text uppercase placeholder:normal-case placeholder:text-neu-text-light/50 focus:outline-none focus:ring-2 focus:ring-neu-blue/50" 
              placeholder="e.g. A1B2C3D4" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-neu-text ml-2">Access Code</label>
            <input 
              required 
              name="access_code" 
              type="text" 
              pattern="[0-9]{6}"
              maxLength={6}
              className="w-full p-4 rounded-2xl bg-neu-bg shadow-neu-pressed-sm text-neu-text text-center tracking-widest text-xl placeholder:tracking-normal placeholder:text-neu-text-light/50 focus:outline-none focus:ring-2 focus:ring-neu-blue/50" 
              placeholder="••••••" 
            />
          </div>

          <div className="pt-4 space-y-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 px-8 rounded-2xl bg-neu-bg shadow-neu-flat text-neu-blue font-bold flex items-center justify-center gap-2 transition-all active:shadow-neu-pressed disabled:opacity-70 disabled:shadow-neu-flat"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
            </button>
            <Link 
              href="/" 
              className="block w-full py-4 px-8 rounded-2xl bg-neu-bg shadow-neu-flat text-neu-text font-bold text-center active:shadow-neu-pressed"
            >
              Back to Home
            </Link>
          </div>
        </form>

        <div className="mt-8 text-center text-sm">
          <Link href="/admin/login" className="text-neu-text-light hover:text-neu-text transition-colors">
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  )
}