'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import { ArrowLeft, Search, Download, Trash2, ArrowUpDown, AlertTriangle } from 'lucide-react'

export default function ParticipantsList() {
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchParticipants()
  }, [sortOrder])

  const fetchParticipants = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .order('created_at', { ascending: sortOrder === 'asc' })
    
    if (data) {
      setParticipants(data)
    }
    setLoading(false)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    
    const { error } = await supabase.from('participants').delete().eq('id', deleteId)
    if (!error) {
      fetchParticipants()
      setDeleteId(null)
    } else {
      alert('Error deleting participant')
    }
    setIsDeleting(false)
  }

  const handleExport = () => {
    const exportData = participants.map(p => ({
      'Registration ID': p.reg_id,
      'Access Code': p.access_code,
      'Full Name': p.name,
      'DOB': p.dob,
      'Place': p.place,
      'District': p.district,
      'Email': p.email,
      'Phone': p.phone,
      'WhatsApp': p.whatsapp,
      'Payment ID': p.payment_id,
      'Registered At': new Date(p.created_at).toLocaleString()
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Participants")
    XLSX.writeFile(wb, "ClickOnNotify_Participants.xlsx")
  }

  const filteredParticipants = participants.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.reg_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      
      {/* Custom Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neu-bg/80 backdrop-blur-md">
          <div className="max-w-sm w-full bg-neu-bg rounded-[32px] p-8 shadow-neu-flat text-center border border-neu-red/20">
            <div className="w-16 h-16 rounded-full bg-neu-bg shadow-neu-pressed-sm flex items-center justify-center mx-auto mb-6 text-neu-red">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-neu-text mb-2">Delete Participant?</h3>
            <p className="text-neu-text-light mb-8 font-medium">Are you sure? This will permanently delete the user and all their quiz submissions.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="flex-1 py-4 rounded-2xl bg-neu-bg shadow-neu-flat text-neu-text font-bold active:shadow-neu-pressed disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-4 rounded-2xl bg-neu-bg shadow-neu-flat text-neu-red font-bold active:shadow-neu-pressed disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-neu-bg p-6 rounded-[32px] shadow-neu-flat">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="p-3 rounded-xl bg-neu-bg shadow-neu-flat hover:shadow-neu-pressed transition-all text-neu-text">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-neu-text">Participants List</h1>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neu-text-light" />
              <input 
                type="text" 
                placeholder="Search name or Reg ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-neu-bg shadow-neu-pressed-sm text-neu-text focus:outline-none"
              />
            </div>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-neu-bg shadow-neu-flat text-neu-blue font-bold hover:shadow-neu-pressed transition-all shrink-0"
            >
              <Download className="w-5 h-5" /> <span className="hidden md:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-neu-bg rounded-[32px] p-6 shadow-neu-flat overflow-hidden">
          <div className="overflow-x-auto pb-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-4 text-xs font-bold text-neu-text-light uppercase tracking-wider border-b-2 border-slate-300/30">Reg ID</th>
                  <th className="p-4 text-xs font-bold text-neu-text-light uppercase tracking-wider border-b-2 border-slate-300/30">Name</th>
                  <th className="p-4 text-xs font-bold text-neu-text-light uppercase tracking-wider border-b-2 border-slate-300/30">Access Code</th>
                  <th className="p-4 text-xs font-bold text-neu-text-light uppercase tracking-wider border-b-2 border-slate-300/30">District & Place</th>
                  <th className="p-4 text-xs font-bold text-neu-text-light uppercase tracking-wider border-b-2 border-slate-300/30">Contact</th>
                  <th className="p-4 text-xs font-bold text-neu-text-light uppercase tracking-wider border-b-2 border-slate-300/30 cursor-pointer" onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
                    <div className="flex items-center gap-1">Date <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-4 text-xs font-bold text-neu-text-light uppercase tracking-wider border-b-2 border-slate-300/30 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-neu-text-light font-medium">Loading participants...</td>
                  </tr>
                ) : filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-neu-text-light font-medium">No participants found.</td>
                  </tr>
                ) : (
                  filteredParticipants.map((p) => (
                    <tr key={p.id} className="border-b border-slate-300/10 hover:bg-slate-300/5 transition-colors">
                      <td className="p-4 font-bold text-neu-blue">{p.reg_id}</td>
                      <td className="p-4 font-semibold text-neu-text">{p.name} <br/><span className="text-xs text-neu-text-light font-normal">{p.dob}</span></td>
                      <td className="p-4 font-mono text-neu-text-light bg-neu-bg shadow-neu-pressed-sm rounded-lg px-2 py-1 inline-block mt-3">{p.access_code}</td>
                      <td className="p-4 text-neu-text">{p.district} <br/><span className="text-xs text-neu-text-light">{p.place}</span></td>
                      <td className="p-4 text-neu-text">{p.phone} <br/><span className="text-xs text-neu-text-light">{p.email}</span></td>
                      <td className="p-4 text-neu-text-light">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => setDeleteId(p.id)}
                          className="p-2 rounded-xl bg-neu-bg shadow-neu-flat text-neu-red hover:shadow-neu-pressed transition-all"
                          title="Delete Participant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
