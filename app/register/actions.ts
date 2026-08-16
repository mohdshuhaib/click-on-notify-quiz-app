'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { unstable_noStore as noStore } from 'next/cache'
import crypto from 'crypto'

function generateRegId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generateAccessCode() {
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += Math.floor(Math.random() * 10).toString()
  }
  return result
}

export async function registerParticipant(formData: FormData) {
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
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  const name = formData.get('name') as string
  const place = formData.get('place') as string
  const district = formData.get('district') as string
  const dob = formData.get('dob') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const whatsapp = formData.get('whatsapp') as string
  const payment_id = formData.get('payment_id') as string

  if (!name || !place || !district || !dob || !email || !phone || !whatsapp || !payment_id) {
    return { success: false, error: 'All fields are required' }
  }

  // Duplicate Check: Same payment_id
  const { data: payCheck } = await supabase
    .from('participants')
    .select('id')
    .eq('payment_id', payment_id)
    .single()

  if (payCheck) {
    return { success: false, error: 'A registration with this Payment ID already exists.' }
  }

  // Duplicate Check: Same name + dob + phone
  const { data: userCheck } = await supabase
    .from('participants')
    .select('id')
    .eq('name', name)
    .eq('dob', dob)
    .eq('phone', phone)
    .single()
  
  if (userCheck) {
    return { success: false, error: 'A user with this Name, DOB, and Phone number is already registered.' }
  }

  const reg_id = generateRegId()
  const access_code = generateAccessCode()

  const { data, error } = await supabase
    .from('participants')
    .insert({
      reg_id,
      access_code,
      name,
      place,
      district,
      dob,
      email,
      phone,
      whatsapp,
      payment_id
    })
    .select()
    .single()

  if (error) {
    console.error("Supabase insert error:", error)
    return { success: false, error: error.message }
  }

  return { success: true, reg_id, access_code, data }
}

export async function getUpiId() {
  noStore()
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {}
      }
    }
  )

  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "upi_id")
    .single()

  if (error) {
    console.error("Error fetching UPI ID:", error)
  }

  return data?.value || "give-your-upi-here@oksbi"
}
