import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { reg_id, access_code } = body

    if (!reg_id || !access_code) {
      return NextResponse.json({ error: 'Registration ID and Access Code are required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: participant, error } = await supabase
      .from('participants')
      .select('id, reg_id')
      .eq('reg_id', reg_id.toUpperCase())
      .eq('access_code', access_code)
      .single()

    if (error || !participant) {
      return NextResponse.json({ error: 'Invalid Registration ID or Access Code' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set('participant_token', participant.id, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
