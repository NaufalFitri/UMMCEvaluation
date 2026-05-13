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

  const { register, handleSubmit, watch, reset, setValue, formState } = (ReactHookForm as any).useForm({
    resolver: zodResolver(evaluationSchema),
    defaultValues: { positioningScore: 5, exposureRating: 'OPTIMAL' as any },
  })

  const clinicalFeedback = watch('clinicalFeedback') || ''
  const positioningScore = watch('positioningScore') || 5
  const errors = formState.errors || {}

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
    <div className="max-w-5xl">
      <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-slate-500">
          {[1, 2, 3, 4].map((item) => (
            <React.Fragment key={item}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= item ? 'bg-[#175cc5] text-white' : 'bg-slate-100 text-slate-500'}`}>
                {item}
              </div>
              {item < 4 ? <div className="h-px flex-1 bg-slate-200" /> : null}
            </React.Fragment>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl border shadow-sm">
        {serverError ? <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded mb-4">{serverError}</div> : null}
        {successId ? (
          <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded mb-4">
            Evaluation saved. ID: {successId}
            <button type="button" onClick={() => { setSuccessId(null); setStep(1); reset() }} className="ml-3 underline">Submit another</button>
          </div>
        ) : null}

        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-semibold mb-4">Patient & Case Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium">Student</label>
                  <Select {...register('studentId')}>
                    <option value="">Select student</option>
                    {students.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name} - {s.studentId}</option>
                    ))}
                  </Select>
                  {errors.studentId?.message ? <p className="text-xs text-red-600 mt-1">{String(errors.studentId.message)}</p> : null}
                </div>
                <div className="rounded-lg border p-3 bg-slate-50">
                  <div className="text-sm text-slate-600">Selected student details will appear here.</div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold mb-4">Pre-Procedure Checklist</h3>
              <div className="space-y-2 text-sm">
                {[
                  'Identity confirmed',
                  'Equipment checked',
                  'Positioning aids prepared',
                  'Safety briefing completed',
                ].map((item) => (
                  <label key={item} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200">
                    <input type="checkbox" className="accent-[#175cc5]" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-semibold mb-4">Image Critique</h3>
              <div className="rounded-lg border bg-slate-100 h-64 flex items-center justify-center text-slate-500">
                Radiograph Preview
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Positioning Score: <span className="font-semibold">{positioningScore}</span></label>
                <Slider value={positioningScore} onChange={(v) => setValue('positioningScore', Number(v), { shouldValidate: true })} />
                <input type="hidden" {...register('positioningScore', { valueAsNumber: true })} />
                {errors.positioningScore?.message ? <p className="text-xs text-red-600 mt-1">{String(errors.positioningScore.message)}</p> : null}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Exposure Rating</label>
                <Select {...register('exposureRating')}>
                  <option value="UNDER_EXPOSED">Under-exposed</option>
                  <option value="OPTIMAL">Optimal</option>
                  <option value="OVER_EXPOSED">Over-exposed</option>
                </Select>
                {errors.exposureRating?.message ? <p className="text-xs text-red-600 mt-1">{String(errors.exposureRating.message)}</p> : null}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="text-base font-semibold mb-4">Post-Care & General Comments</h3>
            <div>
              <label className="block mb-1 text-sm font-medium">Clinical Feedback</label>
              <Textarea rows={6} maxLength={2000} {...register('clinicalFeedback')} />
              <div className="mt-1 text-xs text-slate-500">{clinicalFeedback.length}/2000 characters</div>
              {errors.clinicalFeedback?.message ? <p className="text-xs text-red-600 mt-1">{String(errors.clinicalFeedback.message)}</p> : null}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Final Summary</h3>
            <div className="rounded-lg border p-4 bg-slate-50 text-sm text-slate-700">
              Review your entries and click save to finalize the assessment.
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <div>{step > 1 ? <button type="button" onClick={prev} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50">Back</button> : null}</div>
          <div>
            {step < 4 ? (
              <button type="button" onClick={next} className="px-4 py-2 bg-[#175cc5] hover:bg-[#114ca5] text-white rounded-md">Next</button>
            ) : (
              <Button type="submit" disabled={formState.isSubmitting}>
                {formState.isSubmitting ? 'Saving...' : 'Save & Finish'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
