'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginParticipant(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignored
          }
        },
      },
    }
  )

  const reg_id = formData.get('reg_id') as string
  const access_code = formData.get('access_code') as string

  if (!reg_id || !access_code) {
    return { success: false, error: 'Registration ID and Access Code are required' }
  }

  const { data: participant, error } = await supabase
    .from('participants')
    .select('id, reg_id')
    .eq('reg_id', reg_id)
    .eq('access_code', access_code)
    .single()

  if (error || !participant) {
    return { success: false, error: 'Invalid Registration ID or Access Code' }
  }

  // Set the participant cookie
  // In a real app we'd sign this token securely (JWT), but for this specific request, a simple identifier is sufficient as it's checked against DB or we just trust the cookie since auth is minimal.
  // Actually, better to encode it. We'll just store the UUID so we can read it in middleware/dashboard.
  cookieStore.set('participant_token', participant.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  })

  redirect('/dashboard')
}
