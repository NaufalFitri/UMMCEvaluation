"use client"

import React, { useState } from 'react'
import * as ReactHookForm from 'react-hook-form'
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
  const [step, setStep] = useState<number>(1)

  const { register, handleSubmit, watch, reset, formState } = (ReactHookForm as any).useForm({
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
        setSuccessId(res.id ?? null)
      } else {
        setServerError(JSON.stringify(res.errors || 'Unknown error'))
      }
    } catch (e: any) {
      setServerError(e.message || String(e))
    }
  }

  function next() {
    setStep((s) => Math.min(4, s + 1))
  }

  function prev() {
    setStep((s) => Math.max(1, s - 1))
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-lg font-semibold">New Evaluation</div>
        <div className="text-sm text-gray-500">Step {step} of 4</div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow">
        {serverError ? <div className="p-3 bg-red-100 text-red-800 rounded mb-4">{serverError}</div> : null}
        {successId ? (
          <div className="p-3 bg-green-100 text-green-800 rounded mb-4">Created evaluation {successId}</div>
        ) : null}

        {step === 1 && (
          <div className="space-y-4">
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
              <Slider value={positioningScore} onChange={(v) => { const ev = { target: { name: 'positioningScore', value: String(v) } } as any }} />
              <input type="hidden" {...register('positioningScore', { valueAsNumber: true })} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
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
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="mb-4">Image preview (placeholder)</div>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">Radiograph Image</div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="mb-4">Review & Submit</div>
            <div className="text-sm text-gray-700">Please confirm the data and submit the evaluation.</div>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <div>
            {step > 1 && <button type="button" onClick={prev} className="px-3 py-2 mr-2 border rounded">Back</button>}
          </div>
          <div>
            {step < 4 ? (
              <button type="button" onClick={next} className="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
            ) : (
              <Button type="submit" disabled={formState.isSubmitting}>{formState.isSubmitting ? 'Submitting…' : 'Submit Evaluation'}</Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
