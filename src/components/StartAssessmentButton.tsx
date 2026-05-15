'use client'

import { useState } from 'react'

type StartAssessmentButtonProps = {
  scheduleId: string
  canStart: boolean
}

export default function StartAssessmentButton({ scheduleId, canStart }: StartAssessmentButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStart() {
    if (!canStart || loading) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/evaluations/from-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start assessment')
      }

      window.location.href = `/evaluations/${data.id}`
    } catch (err: any) {
      setError(err.message || 'Failed to start assessment')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={!canStart || loading}
        onClick={handleStart}
        className="rounded-md bg-[#175cc5] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#114ca5] disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {loading ? 'Starting...' : 'Start Assessment'}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
