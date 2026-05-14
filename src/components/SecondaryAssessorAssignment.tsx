'use client'

import React, { useState } from 'react'

export default function SecondaryAssessorAssignment({
  evaluationId,
  assessors,
  currentSecondaryAssessorId,
}: {
  evaluationId: string
  assessors: Array<{ id: string; email: string; name: string | null }>
  currentSecondaryAssessorId?: string | null
}) {
  const [secondaryAssessorId, setSecondaryAssessorId] = useState(currentSecondaryAssessorId || '')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function saveAssignment() {
    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch(`/api/evaluations/${evaluationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secondaryAssessorId: secondaryAssessorId || null }),
      })

      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to assign secondary assessor')
      }

      setMessage('Secondary assessor updated successfully')
    } catch (e: any) {
      setError(e.message || 'Failed to assign secondary assessor')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Secondary Assessor</h3>
        <p className="text-xs text-slate-500">Assign a second assessor to share this evaluation without overwriting the primary assessor’s marks.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Select assessor</span>
          <select
            value={secondaryAssessorId}
            onChange={(e) => setSecondaryAssessorId(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">No secondary assessor</option>
            {assessors.map((assessor) => (
              <option key={assessor.id} value={assessor.id}>
                {assessor.name || assessor.email}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={saveAssignment}
          disabled={saving}
          className="rounded-md bg-[#175cc5] px-4 py-2 text-sm font-medium text-white hover:bg-[#114ca5] disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Assignee'}
        </button>
      </div>

      {message ? <div className="text-sm text-green-700">{message}</div> : null}
      {error ? <div className="text-sm text-red-700">{error}</div> : null}
    </div>
  )
}
