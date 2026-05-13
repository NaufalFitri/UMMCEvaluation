"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { evaluationSchema, type EvaluationInput } from '../lib/validations'
import { createEvaluation } from '../actions/evaluations'
import Select from './ui/Select'
import Slider from './ui/Slider'
import Textarea from './ui/Textarea'
import Button from './ui/Button'

export default function EvaluationForm({ students }: { students: Array<any> }) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)

  const { register, handleSubmit, watch, reset, formState } = useForm<EvaluationInput>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: { positioningScore: 5, exposureRating: 'OPTIMAL' as any },
  })

  const clinicalFeedback = watch('clinicalFeedback') || ''
  const positioningScore = watch('positioningScore') || 5

  async function onSubmit(data: EvaluationInput) {
    setServerError(null)
    setSuccessId(null)
    try {
      const res = await createEvaluation(data as any)
      if (res?.success) {
        setSuccessId(res.id)
      } else {
        setServerError(JSON.stringify(res.errors || 'Unknown error'))
      }
    } catch (e: any) {
      setServerError(e.message || String(e))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      {successId ? (
        <div className="p-3 bg-green-100 text-green-800 rounded">
          Created evaluation {successId}
          <div className="mt-2">
            <button type="button" onClick={() => { setSuccessId(null); reset() }} className="underline">Submit another</button>
          </div>
        </div>
      ) : null}

      {serverError ? <div className="p-3 bg-red-100 text-red-800 rounded">{serverError}</div> : null}

      <div>
        <label className="block mb-1">Student</label>
        <Select {...register('studentId') }>
          <option value="">Select student</option>
          {students.map((s: any) => (
            <option key={s.id} value={s.id}>{s.name} — {s.studentId}</option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block mb-1">Positioning Score: <strong>{positioningScore}</strong></label>
        <Slider value={positioningScore} onChange={(v) => {
          // react-hook-form doesn't work with custom input here, set via callback
          const ev = { target: { name: 'positioningScore', value: String(v) } } as any
          ;(ev.target as any)
        }} />
        <input type="hidden" {...register('positioningScore', { valueAsNumber: true })} />
      </div>

      <div>
        <label className="block mb-1">Exposure Rating</label>
        <Select {...register('exposureRating') }>
          <option value="UNDER_EXPOSED">Under-exposed</option>
          <option value="OPTIMAL">Optimal</option>
          <option value="OVER_EXPOSED">Over-exposed</option>
        </Select>
      </div>

      <div>
        <label className="block mb-1">Clinical Feedback</label>
        <Textarea rows={5} maxLength={2000} {...register('clinicalFeedback') } />
        <div className="text-sm text-gray-500">{clinicalFeedback.length}/2000 characters</div>
      </div>

      <div>
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? 'Submitting…' : 'Submit Evaluation'}
        </Button>
      </div>
    </form>
  )
}
