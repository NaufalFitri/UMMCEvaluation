'use client'

import React, { useState } from 'react'
import * as XLSX from 'xlsx'

type UploadTarget = 'assessors' | 'students' | 'schedules'

type SectionResult = {
  created: number
  failed: number
  errors: string[]
}

type UploadResults = {
  assessors: SectionResult
  students: SectionResult
  schedules: SectionResult
}

type SectionBulkUploadProps = {
  target: UploadTarget
  title: string
  description: string
  sheetName: string
  columns: string[]
  sampleRows: Array<Record<string, string>>
  onUploaded?: () => void | Promise<void>
}

export default function SectionBulkUpload({
  target,
  title,
  description,
  sheetName,
  columns,
  sampleRows,
  onUploaded,
}: SectionBulkUploadProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<SectionResult | null>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('target', target)

      const response = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      const sectionResult = (data.results as UploadResults)[target]
      setResult(sectionResult)

      if (onUploaded) {
        await onUploaded()
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  function downloadTemplate() {
    const wb: XLSX.WorkBook = { SheetNames: [sheetName], Sheets: {} }
    wb.Sheets[sheetName] = XLSX.utils.json_to_sheet(sampleRows)
    XLSX.writeFile(wb, `${target}_template.xlsx`)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
        <button
          type="button"
          onClick={downloadTemplate}
          className="rounded-md border border-[#175cc5]/30 bg-[#175cc5]/5 px-3 py-2 text-sm font-medium text-[#175cc5] hover:bg-[#175cc5]/10"
        >
          Download {sheetName} Template
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleUpload}
          disabled={loading}
          className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-50"
        />
        <div className="text-xs text-slate-500">
          Columns: {columns.join(', ')}
        </div>
      </div>

      {loading ? <p className="mt-3 text-sm text-slate-600">Processing file...</p> : null}

      {result ? (
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
          <div className="text-green-700">Created: {result.created}</div>
          <div className="text-red-700">Failed: {result.failed}</div>
          {result.errors.length > 0 ? (
            <div className="mt-2 space-y-1 text-xs text-red-600">
              {result.errors.slice(0, 3).map((item, index) => (
                <div key={`${item}-${index}`}>{item}</div>
              ))}
              {result.errors.length > 3 ? <div>... and {result.errors.length - 3} more</div> : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
    </div>
  )
}
