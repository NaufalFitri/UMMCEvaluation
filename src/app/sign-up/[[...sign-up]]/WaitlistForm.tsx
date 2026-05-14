'use client'

import React, { useState } from 'react'

export default function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    try {
      const res = await fetch('/api/waitlist/local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      if (!res.ok) throw new Error('Failed to join waitlist')
      setOk(true)
    } catch (e: any) {
      setErr(e.message)
    }
  }

  if (ok) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="rounded-xl bg-green-50 border border-green-100 p-4 text-sm text-green-800">Thanks — your request has been recorded. An admin will review it.</div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
          <input value={name} onChange={(e)=>setName(e.target.value)} required type="text" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} required type="email" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
        </div>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button type="submit" className="w-full rounded-xl bg-[#175cc5] px-4 py-3 font-medium text-white">Join Waitlist</button>
      </form>
    </div>
  )
}
