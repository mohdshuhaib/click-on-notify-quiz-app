'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Loader2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-neu-bg rounded-[32px] p-8 shadow-neu-flat">
        <div className="text-center mb-8 space-y-2">
          <div className="w-16 h-16 bg-neu-bg rounded-full shadow-neu-flat flex items-center justify-center mx-auto mb-4 text-neu-blue">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-neu-text">Admin Portal</h1>
          <p className="text-neu-text-light font-medium">Authorized personnel only</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-neu-bg shadow-neu-pressed-sm border border-neu-red/20 text-neu-red text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neu-text ml-2">Email</label>
            <input 
              required 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-2xl bg-neu-bg shadow-neu-pressed-sm text-neu-text placeholder:text-neu-text-light/50 focus:outline-none focus:ring-2 focus:ring-neu-blue/50" 
              placeholder="admin@example.com" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-neu-text ml-2">Password</label>
            <input 
              required 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-2xl bg-neu-bg shadow-neu-pressed-sm text-neu-text placeholder:text-neu-text-light/50 focus:outline-none focus:ring-2 focus:ring-neu-blue/50" 
              placeholder="••••••••" 
            />
          </div>

          <div className="pt-4 space-y-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 px-8 rounded-2xl bg-neu-bg shadow-neu-flat text-neu-blue font-bold flex items-center justify-center gap-2 transition-all active:shadow-neu-pressed disabled:opacity-70 disabled:shadow-neu-flat"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In Securely'}
            </button>
            <Link 
              href="/" 
              className="block w-full py-4 px-8 rounded-2xl bg-neu-bg shadow-neu-flat text-neu-text font-bold text-center active:shadow-neu-pressed"
            >
              Back to App
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
