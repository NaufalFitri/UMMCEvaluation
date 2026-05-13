'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'

export default function NewEvaluationPage() {
  const router = useRouter()
  const [studentId, setStudentId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleStartEvaluation = async () => {
    if (!studentId) return

    setIsLoading(true)
    try {
      // Create a new evaluation
      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      })

      if (!response.ok) throw new Error('Failed to create evaluation')
      
      const { id } = await response.json()

      // Redirect to the latest evaluation form route
      router.push(`/evaluations/${id}`)
    } catch (error) {
      console.error('Error creating evaluation:', error)
      alert('Failed to create evaluation')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[radial-gradient(circle_at_top_left,_rgba(23,92,197,0.10),_transparent_32%),linear-gradient(180deg,_#f5f9ff_0%,_#eef4fb_100%)] p-6 lg:p-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <section className="rounded-3xl bg-gradient-to-br from-[#08325b] via-[#0a3c70] to-[#042645] p-8 text-white shadow-2xl shadow-slate-900/10">
          <p className="text-xs uppercase tracking-[0.24em] text-blue-200">Radiograph Workflow</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight lg:text-5xl">New Evaluation</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-blue-100">
            Start a structured radiograph assessment with separate section pages, guided navigation, and clean progress tracking.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <div className="text-sm text-blue-100">Flow</div>
              <div className="mt-1 text-lg font-semibold">Section-by-section</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <div className="text-sm text-blue-100">Navigation</div>
              <div className="mt-1 text-lg font-semibold">Sidebar + next/prev</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <div className="text-sm text-blue-100">Theme</div>
              <div className="mt-1 text-lg font-semibold">Clinical blue</div>
            </div>
          </div>
        </section>

        <Card className="rounded-3xl p-8 shadow-xl shadow-slate-900/5 border-slate-200/80">
          <h2 className="text-2xl font-semibold text-slate-900">Launch Assessment</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter the student identifier to create the evaluation and move into the first section.
          </p>

          <div className="mt-7 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Select Student
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter Student ID"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#175cc5] focus:ring-4 focus:ring-[#175cc5]/10"
              />
            </div>

            <div className="rounded-2xl border border-[#cfe0ff] bg-[#eff5ff] p-4 text-sm text-[#0b3a66]">
              <strong>Note:</strong> You’ll proceed through separate assessment pages, each with its own layout and save controls.
            </div>

            <Button
              onClick={handleStartEvaluation}
              disabled={!studentId || isLoading}
              className="w-full rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-[#175cc5]/25"
            >
              {isLoading ? 'Creating...' : 'Start Assessment'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="w-full rounded-xl py-3.5"
            >
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
