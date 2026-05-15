'use client'

import React, { useState } from 'react'
import * as XLSX from 'xlsx'

type UploadResults = {
  assessors: { created: number; failed: number; errors: string[] }
  students: { created: number; failed: number; errors: string[] }
  schedules: { created: number; failed: number; errors: string[] }
}

export default function BulkUploadPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<UploadResults | null>(null)
  const [error, setError] = useState('')

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Upload failed')
        return
      }

      setResults(data.results)
    } catch (err: any) {
      setError(err.message || 'Failed to upload file')
    } finally {
      setLoading(false)
    }
  }

  function downloadTemplate() {
    const template = {
      Assessors: [
        {
          email: 'assessor1@university.edu',
          name: 'Dr. Ahmad Ali',
        },
        {
          email: 'assessor2@university.edu',
          name: 'Prof. Siti Nur',
        },
      ],
      Students: [
        {
          studentId: 'STU001',
          name: 'Muhammad Farhan',
          email: 'farhan@student.edu',
        },
        {
          studentId: 'STU002',
          name: 'Nur Azlina',
          email: 'azlina@student.edu',
        },
      ],
      Schedules: [
        {
          studentId: 'STU001',
          primaryAssessorEmail: 'assessor1@university.edu',
          secondaryAssessorEmail: 'assessor2@university.edu',
          scheduledAt: '2025-05-20 10:00:00',
          location: 'X-ray Room 2',
          notes: 'Chest radiography assessment',
        },
        {
          studentId: 'STU002',
          primaryAssessorEmail: 'assessor2@university.edu',
          secondaryAssessorEmail: '',
          scheduledAt: '2025-05-21 14:00:00',
          location: 'X-ray Room 1',
          notes: 'Spine radiography assessment',
        },
      ],
    }

    const wb: XLSX.WorkBook = { SheetNames: [], Sheets: {} }

    Object.entries(template).forEach(([sheetName, data]) => {
      const ws = XLSX.utils.json_to_sheet(data)
      wb.SheetNames.push(sheetName)
      wb.Sheets[sheetName] = ws
    })

    XLSX.writeFile(wb, 'bulk_upload_template.xlsx')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Bulk Upload</h1>
        <p className="text-slate-600 mt-2">Import Assessors, Students, and Schedules from an Excel file</p>
      </div>

      {/* Instructions Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#0f3d72] to-[#175cc5] px-6 py-5 text-white">
          <h2 className="text-lg font-semibold">Excel File Format</h2>
          <p className="mt-1 text-sm text-blue-100">Use 3 sheets in one workbook: Assessors, Students, and Schedules.</p>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Assessors</h3>
            <p className="mt-2 text-xs text-slate-500">Required columns</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md border border-slate-200 bg-white px-2 py-1">email</span>
              <span className="rounded-md border border-slate-200 bg-white px-2 py-1">name</span>
            </div>
            <p className="mt-3 text-xs text-slate-600">Example: assessor1@university.edu | Dr. Ahmad Ali</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Students</h3>
            <p className="mt-2 text-xs text-slate-500">Required columns</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md border border-slate-200 bg-white px-2 py-1">studentId</span>
              <span className="rounded-md border border-slate-200 bg-white px-2 py-1">name</span>
              <span className="rounded-md border border-slate-200 bg-white px-2 py-1">email</span>
            </div>
            <p className="mt-3 text-xs text-slate-600">Example: STU001 | Muhammad Farhan | farhan@student.edu</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Schedules</h3>
            <p className="mt-2 text-xs text-slate-500">Required columns</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md border border-slate-200 bg-white px-2 py-1">studentId</span>
              <span className="rounded-md border border-slate-200 bg-white px-2 py-1">primaryAssessorEmail</span>
              <span className="rounded-md border border-slate-200 bg-white px-2 py-1">scheduledAt</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Optional columns</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md border border-slate-200 bg-white px-2 py-1">secondaryAssessorEmail</span>
              <span className="rounded-md border border-slate-200 bg-white px-2 py-1">location</span>
              <span className="rounded-md border border-slate-200 bg-white px-2 py-1">notes</span>
            </div>
            <p className="mt-3 text-xs text-slate-600">Date format: YYYY-MM-DD HH:mm:ss or native Excel date.</p>
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-4">
          <button
            onClick={downloadTemplate}
            className="rounded-md bg-[#175cc5] px-4 py-2 font-medium text-white transition hover:bg-[#114ca5]"
          >
            Download Full Template Excel
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Upload Excel File</h2>
        <div className="space-y-4">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={loading}
            className="block w-full text-sm text-slate-700 border border-slate-300 rounded-md px-3 py-2 disabled:opacity-50"
          />
          {loading && <div className="text-sm text-slate-600">Processing file...</div>}
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Upload Results</h2>

          {/* Assessors Result */}
          <div className={`rounded-lg border p-4 ${results.assessors.created > 0 ? 'border-green-200 bg-green-50' : results.assessors.failed > 0 ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
            <h3 className="font-medium text-slate-900">Assessors</h3>
            <div className="mt-2 text-sm">
              <p className="text-green-700">✓ Created: {results.assessors.created}</p>
              <p className="text-red-700">✗ Failed: {results.assessors.failed}</p>
              {results.assessors.errors.length > 0 && (
                <div className="mt-2 text-xs text-red-600">
                  {results.assessors.errors.slice(0, 3).map((err, i) => (
                    <div key={i}>{err}</div>
                  ))}
                  {results.assessors.errors.length > 3 && <div>... and {results.assessors.errors.length - 3} more errors</div>}
                </div>
              )}
            </div>
          </div>

          {/* Students Result */}
          <div className={`rounded-lg border p-4 ${results.students.created > 0 ? 'border-green-200 bg-green-50' : results.students.failed > 0 ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
            <h3 className="font-medium text-slate-900">Students</h3>
            <div className="mt-2 text-sm">
              <p className="text-green-700">✓ Created: {results.students.created}</p>
              <p className="text-red-700">✗ Failed: {results.students.failed}</p>
              {results.students.errors.length > 0 && (
                <div className="mt-2 text-xs text-red-600">
                  {results.students.errors.slice(0, 3).map((err, i) => (
                    <div key={i}>{err}</div>
                  ))}
                  {results.students.errors.length > 3 && <div>... and {results.students.errors.length - 3} more errors</div>}
                </div>
              )}
            </div>
          </div>

          {/* Schedules Result */}
          <div className={`rounded-lg border p-4 ${results.schedules.created > 0 ? 'border-green-200 bg-green-50' : results.schedules.failed > 0 ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
            <h3 className="font-medium text-slate-900">Schedules</h3>
            <div className="mt-2 text-sm">
              <p className="text-green-700">✓ Created: {results.schedules.created}</p>
              <p className="text-red-700">✗ Failed: {results.schedules.failed}</p>
              {results.schedules.errors.length > 0 && (
                <div className="mt-2 text-xs text-red-600">
                  {results.schedules.errors.slice(0, 3).map((err, i) => (
                    <div key={i}>{err}</div>
                  ))}
                  {results.schedules.errors.length > 3 && <div>... and {results.schedules.errors.length - 3} more errors</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-700 font-medium">Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}
    </div>
  )
}
