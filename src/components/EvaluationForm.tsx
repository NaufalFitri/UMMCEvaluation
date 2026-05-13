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

  const sections = [
    'Patient & Case Information',
    'Pre-Procedure Checklist',
    'Procedure Radiografi',
    'Image Critique',
    'Post-Care & General Comments',
    'Penilai Kedua Summary',
    'Pawaian Imej Oleh Penilai',
    'Discussion / Perbincangan',
    'Final Result',
    'History / Summary',
    'Verification',
    'Save & Finish',
  ]

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
    setStep((s) => Math.min(sections.length, s + 1))
  }

  function prev() {
    setStep((s) => Math.max(1, s - 1))
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sections.map((section, index) => {
            const item = index + 1
            const active = step === item
            const done = step > item

            return (
              <button
                key={section}
                type="button"
                onClick={() => setStep(item)}
                className={`min-w-[170px] text-left rounded-lg px-3 py-2 border transition ${
                  active
                    ? 'bg-[#175cc5] text-white border-[#175cc5]'
                    : done
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="text-[11px] uppercase tracking-wide opacity-80">Section {item}</div>
                <div className="text-xs font-medium truncate">{section}</div>
              </button>
            )
          })}
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
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Pre-Procedure Checklist</h3>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 text-left">Checklist Item</th>
                    <th className="p-3 text-center">Y</th>
                    <th className="p-3 text-center">N</th>
                    <th className="p-3 text-center">N/A</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    'Patient identity confirmed',
                    'Procedure explained',
                    'Exposure settings checked',
                    'Shielding prepared',
                  ].map((item) => (
                    <tr key={item} className="border-t">
                      <td className="p-3">{item}</td>
                      <td className="p-3 text-center"><input type="radio" name={item} className="accent-[#175cc5]" /></td>
                      <td className="p-3 text-center"><input type="radio" name={item} className="accent-[#175cc5]" /></td>
                      <td className="p-3 text-center"><input type="radio" name={item} className="accent-[#175cc5]" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Procedure Radiografi</h3>
            <div className="rounded-lg border p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {[
                'Centering correctly aligned',
                'Collimation appropriate',
                'Patient posture maintained',
                'Artifact minimization applied',
              ].map((item) => (
                <label key={item} className="flex items-center gap-2 p-2 rounded border border-slate-200">
                  <input type="checkbox" className="accent-[#175cc5]" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
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

        {step === 5 && (
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

        {step === 6 && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Penilai Kedua Summary</h3>
            <div className="rounded-lg border p-4 bg-slate-50 text-sm text-slate-700">
              Ringkasan penilaian penilai kedua akan dipaparkan di sini.
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Pawaian Imej Oleh Penilai</h3>
            <div className="rounded-lg border p-4 bg-slate-50 text-sm text-slate-700">
              Grid perbandingan visual quality and projection criteria.
            </div>
          </div>
        )}

        {step === 8 && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Discussion / Perbincangan</h3>
            <Textarea rows={6} placeholder="Justification, issues, and proposed improvements..." />
          </div>
        )}

        {step === 9 && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Final Result</h3>
            <div className="rounded-xl border p-6 bg-green-50 text-green-800 max-w-sm">
              <div className="text-xs uppercase tracking-wide">Decision</div>
              <div className="text-3xl font-bold mt-1">PASS</div>
              <div className="text-sm mt-1">Excellent work. Keep it up.</div>
            </div>
          </div>
        )}

        {step === 10 && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold">History / Summary</h3>
            <div className="rounded-lg border p-4 bg-slate-50 text-sm text-slate-700">
              Recent assessment trend and history summary placeholders.
            </div>
          </div>
        )}

        {step === 11 && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Verification</h3>
            <label className="flex items-center gap-3 p-3 border rounded-lg">
              <input type="checkbox" className="accent-[#175cc5]" />
              <span>I verify this assessment is complete and accurate.</span>
            </label>
          </div>
        )}

        {step === 12 && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Save & Finish</h3>
            <div className="rounded-lg border p-4 bg-slate-50 text-sm text-slate-700">
              Final review complete. Click Save & Finish to submit this evaluation record.
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <div>{step > 1 ? <button type="button" onClick={prev} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50">Back</button> : null}</div>
          <div>
            {step < sections.length ? (
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
