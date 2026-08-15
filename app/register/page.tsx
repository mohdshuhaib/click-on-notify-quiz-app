'use client'

import { useState, useRef, useEffect } from 'react'
import { registerParticipant, getUpiId } from './actions'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, Copy, CheckCircle } from 'lucide-react'

const districts = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", 
  "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode", 
  "Wayanad", "Kannur", "Kasaragod", "Lakshadweep", "Karnataka", "Tamil Nadu", "Abroad"
]

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [result, setResult] = useState<{reg_id: string, access_code: string, data: any} | null>(null)
  
  const [sameAsPhone, setSameAsPhone] = useState(false)
  const [phoneVal, setPhoneVal] = useState('')
  const [whatsappVal, setWhatsappVal] = useState('')
  const [upiId, setUpiId] = useState('give-your-upi-here@oksbi')

  useEffect(() => {
    getUpiId().then(setUpiId).catch(console.error)
  }, [])

  const pdfRef = useRef<HTMLDivElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneVal(e.target.value)
    if (sameAsPhone) setWhatsappVal(e.target.value)
  }

  const handleSameAsPhone = () => {
    setSameAsPhone(!sameAsPhone)
    if (!sameAsPhone) {
      setWhatsappVal(phoneVal)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    try {
      const res = await registerParticipant(formData)
      if (res.success) {
        setResult({ reg_id: res.reg_id!, access_code: res.access_code!, data: res.data })
        setSuccess(true)
      } else {
        setError(res.error || 'Registration failed')
        setTimeout(() => {
          errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 100)
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!result) return
    const text = `Reg ID: ${result.reg_id}\nAccess Code: ${result.access_code}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (success && result) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-neu-bg rounded-[32px] p-8 shadow-neu-flat">
          <div className="text-center space-y-4 mb-8">
            <div className="w-20 h-20 bg-neu-bg rounded-full shadow-neu-flat flex items-center justify-center mx-auto text-neu-green">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-neu-text">Registration Successful!</h1>
            <p className="text-neu-text-light">Please save your credentials carefully.</p>
          </div>

          <div 
            ref={pdfRef} 
            className="bg-neu-bg p-8 rounded-2xl shadow-neu-pressed-sm mb-8 space-y-6"
          >
            <div className="flex justify-between items-center border-b-2 border-slate-300/50 pb-4">
              <h2 className="text-xl font-bold text-neu-text">Click on Notify Quiz</h2>
              {/* @ts-ignore */}
              <img src="/clicknotifylogo.jpeg" alt="Logo" width={50} height={50} className="rounded-full shadow-sm" crossOrigin="anonymous" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-neu-text text-sm">
              <div><span className="font-semibold">Name:</span> {result.data.name}</div>
              <div><span className="font-semibold">DOB:</span> {result.data.dob}</div>
              <div><span className="font-semibold">Phone:</span> {result.data.phone}</div>
              <div className="break-all"><span className="font-semibold">Email:</span> {result.data.email}</div>
              <div className="break-all"><span className="font-semibold">WhatsApp:</span> {result.data.whatsapp}</div>
              <div className="break-all"><span className="font-semibold">Payment ID:</span> {result.data.payment_id}</div>
              <div className="col-span-2"><span className="font-semibold">Place:</span> {result.data.place}, {result.data.district}</div>
            </div>

            <div className="bg-neu-bg p-4 rounded-xl shadow-neu-flat flex flex-col md:flex-row gap-4 items-center justify-center text-center mt-6">
              <div className="space-y-1">
                <div className="text-xs font-bold text-neu-text-light uppercase tracking-wider">Registration ID</div>
                <div className="text-2xl font-black text-neu-blue tracking-widest">{result.reg_id}</div>
              </div>
              <div className="hidden md:block w-px h-12 bg-slate-300"></div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-neu-text-light uppercase tracking-wider">Access Code</div>
                <div className="text-2xl font-black text-neu-text tracking-widest">{result.access_code}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={handleCopy}
              className="w-full py-4 px-6 rounded-2xl bg-neu-bg shadow-neu-flat text-neu-text font-bold flex items-center justify-center gap-2 transition-all active:shadow-neu-pressed"
            >
              {copied ? <CheckCircle className="w-5 h-5 text-neu-green" /> : <Copy className="w-5 h-5" />}
              {copied ? 'Copied!' : 'Copy Credentials'}
            </button>
            
            <div className="bg-neu-bg p-4 rounded-xl shadow-neu-pressed-sm border border-neu-blue/20 text-center">
              <p className="text-sm font-semibold text-neu-blue">
                Important: Please copy and securely save your Registration ID and Access Code for all future quiz activities.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/login" className="text-neu-text-light hover:text-neu-blue font-medium underline underline-offset-4">
              Go to Login Page
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-neu-bg rounded-[32px] p-6 md:p-10 shadow-neu-flat">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-neu-text">Participant Registration</h1>
          <p className="text-neu-text-light">Fill in your details to get your Registration ID.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neu-text ml-2">Full Name</label>
              <input required name="name" type="text" className="w-full p-4 rounded-2xl bg-neu-bg shadow-neu-pressed-sm text-neu-text placeholder:text-neu-text-light/50 focus:outline-none focus:ring-2 focus:ring-neu-blue/50" placeholder="Shuhaib M" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neu-text ml-2">Date of Birth</label>
              <input required name="dob" type="date" className="w-full p-4 rounded-2xl bg-neu-bg shadow-neu-pressed-sm text-neu-text focus:outline-none focus:ring-2 focus:ring-neu-blue/50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neu-text ml-2">Place</label>
              <input required name="place" type="text" className="w-full p-4 rounded-2xl bg-neu-bg shadow-neu-pressed-sm text-neu-text placeholder:text-neu-text-light/50 focus:outline-none focus:ring-2 focus:ring-neu-blue/50" placeholder="Your City/Town" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neu-text ml-2">District</label>
              <select required name="district" className="w-full p-4 rounded-2xl bg-neu-bg shadow-neu-pressed-sm text-neu-text focus:outline-none focus:ring-2 focus:ring-neu-blue/50 appearance-none">
                <option value="">Select District</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-neu-text ml-2">Email Address</label>
            <input required name="email" type="email" className="w-full p-4 rounded-2xl bg-neu-bg shadow-neu-pressed-sm text-neu-text placeholder:text-neu-text-light/50 focus:outline-none focus:ring-2 focus:ring-neu-blue/50" placeholder="shuhaib@example.com" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neu-text ml-2">Phone Number</label>
              <input required name="phone" type="tel" value={phoneVal} onChange={handlePhoneChange} className="w-full p-4 rounded-2xl bg-neu-bg shadow-neu-pressed-sm text-neu-text placeholder:text-neu-text-light/50 focus:outline-none focus:ring-2 focus:ring-neu-blue/50" placeholder="+91 9645184118" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-end ml-2 mb-2">
                <label className="text-sm font-semibold text-neu-text">WhatsApp</label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-neu-text-light font-medium">
                  <input type="checkbox" className="w-4 h-4 rounded shadow-neu-pressed-sm accent-neu-blue" checked={sameAsPhone} onChange={handleSameAsPhone} />
                  Same as Phone
                </label>
              </div>
              <input required name="whatsapp" type="tel" value={whatsappVal} onChange={(e) => { setWhatsappVal(e.target.value); setSameAsPhone(false) }} className="w-full p-4 rounded-2xl bg-neu-bg shadow-neu-pressed-sm text-neu-text placeholder:text-neu-text-light/50 focus:outline-none focus:ring-2 focus:ring-neu-blue/50" placeholder="+91 9645184118" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neu-bg shadow-neu-pressed-sm space-y-4 border border-slate-300/30">
            <div>
              <h3 className="font-bold text-neu-text">Payment Verification</h3>
              <p className="text-xs text-neu-text-light mt-1">Please complete the payment using GPay and enter the Transaction/Payment ID below.</p>
            </div>
            <a href={`upi://pay?pa=${upiId}&pn=Click%20on%20Notify%20Quiz&am=20.00&cu=INR`} target="_blank" className="block w-full py-3 rounded-xl bg-neu-bg shadow-neu-flat text-neu-blue font-bold text-center active:shadow-neu-pressed-sm text-sm">
              Open GPay to Pay ₹20
            </a>

            <div className="space-y-2 pt-2">
              <label className="text-sm font-semibold text-neu-text ml-2">Payment ID (Required)</label>
              <input required name="payment_id" type="text" className="w-full p-4 rounded-2xl bg-neu-bg shadow-neu-pressed-sm text-neu-text placeholder:text-neu-text-light/50 focus:outline-none focus:ring-2 focus:ring-neu-blue/50" placeholder="e.g. T20210202123456789" />
            </div>
          </div>

          {error && (
            <div ref={errorRef} className="p-4 rounded-xl bg-neu-bg shadow-neu-pressed-sm border border-neu-red/20 text-neu-red text-center font-bold text-sm animate-pulse">
              {error}
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
            <Link href="/" className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-neu-bg shadow-neu-flat text-neu-text font-bold text-center active:shadow-neu-pressed">
              Back
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex-1 py-4 px-8 rounded-2xl bg-neu-bg shadow-neu-flat text-neu-blue font-bold flex items-center justify-center gap-2 transition-all active:shadow-neu-pressed disabled:opacity-70 disabled:shadow-neu-flat"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
