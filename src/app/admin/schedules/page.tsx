'use client'

import React, { useEffect, useMemo, useState } from 'react'
import SectionBulkUpload from '@/components/admin/SectionBulkUpload'

type StudentOption = {
  id: string
  studentId: string
  name: string
}

type AssessorOption = {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'ASSESSOR' | 'STUDENT'
}

type Schedule = {
  id: string
  studentId: string
  primaryAssessorId: string
  secondaryAssessorId: string | null
  scheduledAt: string
  location: string | null
  notes: string | null
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  student?: StudentOption
  primaryAssessor?: { id: string; name: string | null; email: string }
  secondaryAssessor?: { id: string; name: string | null; email: string } | null
}

function toDatetimeLocalValue(value: string | Date) {
  const d = new Date(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  
  // Adjust for timezone to display local time correctly in datetime-local input
  const timezoneOffset = d.getTimezoneOffset() * 60 * 1000
  const localDate = new Date(d.getTime() - timezoneOffset)
  
  const year = localDate.getUTCFullYear()
  const month = pad(localDate.getUTCMonth() + 1)
  const date = pad(localDate.getUTCDate())
  const hours = pad(localDate.getUTCHours())
  const minutes = pad(localDate.getUTCMinutes())
  
  return `${year}-${month}-${date}T${hours}:${minutes}`
}

function formatDateTime(value: string | Date) {
  const d = new Date(value)
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ScheduleManagementPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [students, setStudents] = useState<StudentOption[]>([])
  const [assessors, setAssessors] = useState<AssessorOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    studentId: '',
    primaryAssessorId: '',
    secondaryAssessorId: '',
    scheduledAt: '',
    location: '',
    notes: '',
    status: 'SCHEDULED',
  })

  useEffect(() => {
    void loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    setError('')
    try {
      const [scheduleRes, studentRes, assessorRes] = await Promise.all([
        fetch('/api/admin/schedules'),
        fetch('/api/admin/students'),
        fetch('/api/admin/assessors'),
      ])

      if (!scheduleRes.ok || !studentRes.ok || !assessorRes.ok) {
        throw new Error('Failed to load scheduling data')
      }

      const [scheduleData, studentData, assessorData] = await Promise.all([
        scheduleRes.json(),
        studentRes.json(),
        assessorRes.json(),
      ])

      setSchedules(scheduleData)
      setStudents(studentData)
      setAssessors(assessorData)
    } catch (err: any) {
      setError(err.message || 'Failed to load scheduling data')
    } finally {
      setLoading(false)
    }
  }

  const sortedSchedules = useMemo(() => {
    return [...schedules].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
  }, [schedules])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.studentId || !formData.primaryAssessorId || !formData.scheduledAt) {
      setError('Student, primary assessor, and schedule date/time are required')
      return
    }

    if (formData.secondaryAssessorId && formData.secondaryAssessorId === formData.primaryAssessorId) {
      setError('Primary and secondary assessor cannot be the same person')
      return
    }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/schedules/${editingId}` : '/api/admin/schedules'

      // Parse datetime-local string and adjust for timezone
      const localDate = new Date(formData.scheduledAt)
      const timezoneOffset = localDate.getTimezoneOffset() * 60 * 1000
      const utcDate = new Date(localDate.getTime() + timezoneOffset)

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          scheduledAt: utcDate.toISOString(),
          secondaryAssessorId: formData.secondaryAssessorId || null,
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to save schedule')
      }

      await loadAll()
      setShowForm(false)
      setEditingId(null)
      setFormData({
        studentId: '',
        primaryAssessorId: '',
        secondaryAssessorId: '',
        scheduledAt: '',
        location: '',
        notes: '',
        status: 'SCHEDULED',
      })
      setSuccess(editingId ? 'Schedule updated successfully' : 'Schedule created successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to save schedule')
    }
  }

  function handleEdit(schedule: Schedule) {
    setEditingId(schedule.id)
    setFormData({
      studentId: schedule.studentId,
      primaryAssessorId: schedule.primaryAssessorId,
      secondaryAssessorId: schedule.secondaryAssessorId || '',
      scheduledAt: toDatetimeLocalValue(schedule.scheduledAt),
      location: schedule.location || '',
      notes: schedule.notes || '',
      status: schedule.status,
    })
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this schedule?')) return

    setError('')
    setSuccess('')
    try {
      const response = await fetch(`/api/admin/schedules/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Failed to delete schedule')
      }
      await loadAll()
      setSuccess('Schedule deleted successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to delete schedule')
    }
  }

  async function handleStartEvaluation(scheduleId: string) {
    setError('')
    try {
      const response = await fetch('/api/evaluations/from-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to start evaluation')
      }

      const result = await response.json()
      window.location.href = `/evaluations/${result.id}`
    } catch (err: any) {
      setError(err.message || 'Failed to start evaluation')
    }
  }

  if (loading) {
    return <div className="py-8 text-center">Loading schedules...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Assessment Schedule Management</h2>
          <p className="text-sm text-slate-500">Plan evaluation sessions ahead of time for students and assessors.</p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              setEditingId(null)
              setFormData({
                studentId: '',
                primaryAssessorId: '',
                secondaryAssessorId: '',
                scheduledAt: '',
                location: '',
                notes: '',
                status: 'SCHEDULED',
              })
            }
            setShowForm(!showForm)
          }}
          className="rounded-md bg-[#175cc5] px-4 py-2 text-white transition hover:bg-[#114ca5]"
        >
          {showForm ? 'Cancel' : '+ Create Schedule'}
        </button>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : null}
      {success ? <div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-700">{success}</div> : null}

      <SectionBulkUpload
        target="schedules"
        title="Bulk Upload Schedules"
        description="Upload one Excel file for schedules only from this page."
        sheetName="Schedules"
        columns={['studentId', 'primaryAssessorEmail', 'secondaryAssessorEmail', 'scheduledAt', 'location', 'notes']}
        sampleRows={[
          {
            studentId: 'STU001',
            primaryAssessorEmail: 'assessor1@university.edu',
            secondaryAssessorEmail: 'assessor2@university.edu',
            scheduledAt: '2026-05-20 10:00:00',
            location: 'X-ray Room 2',
            notes: 'Chest radiography assessment',
          },
          {
            studentId: 'STU002',
            primaryAssessorEmail: 'assessor2@university.edu',
            secondaryAssessorEmail: '',
            scheduledAt: '2026-05-21 14:00:00',
            location: 'X-ray Room 1',
            notes: 'Spine radiography assessment',
          },
        ]}
        onUploaded={loadAll}
      />

      {showForm ? (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">{editingId ? 'Edit Schedule' : 'Create New Schedule'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Student</label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#175cc5]"
                >
                  <option value="">Select student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.studentId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#175cc5]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Primary Assessor</label>
                <select
                  required
                  value={formData.primaryAssessorId}
                  onChange={(e) => setFormData({ ...formData, primaryAssessorId: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#175cc5]"
                >
                  <option value="">Select primary assessor</option>
                  {assessors
                    .filter((a) => a.role === 'ASSESSOR' || a.role === 'ADMIN')
                    .map((assessor) => (
                      <option key={assessor.id} value={assessor.id}>
                        {assessor.name || assessor.email}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Secondary Assessor (optional)</label>
                <select
                  value={formData.secondaryAssessorId}
                  onChange={(e) => setFormData({ ...formData, secondaryAssessorId: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#175cc5]"
                >
                  <option value="">None</option>
                  {assessors
                    .filter((a) => (a.role === 'ASSESSOR' || a.role === 'ADMIN') && a.id !== formData.primaryAssessorId)
                    .map((assessor) => (
                      <option key={assessor.id} value={assessor.id}>
                        {assessor.name || assessor.email}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Location (optional)</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Example: X-ray Room 2"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#175cc5]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#175cc5]"
                >
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Notes (optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#175cc5]"
                placeholder="Any extra instruction for this session"
              />
            </div>

            <button type="submit" className="rounded-md bg-[#175cc5] px-4 py-2 text-white transition hover:bg-[#114ca5]">
              {editingId ? 'Update Schedule' : 'Create Schedule'}
            </button>
          </form>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {sortedSchedules.length === 0 ? (
          <div className="p-6 text-center text-slate-500">No schedules yet. Create one to start planned evaluations.</div>
        ) : (
          <table className="w-full table-auto">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Date/Time</th>
                <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Student</th>
                <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Primary</th>
                <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Secondary</th>
                <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Location</th>
                <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Status</th>
                <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSchedules.map((schedule) => (
                <tr key={schedule.id} className="border-t hover:bg-slate-50">
                  <td className="p-3 text-sm">{formatDateTime(schedule.scheduledAt)}</td>
                  <td className="p-3">{schedule.student ? `${schedule.student.name} (${schedule.student.studentId})` : '-'}</td>
                  <td className="p-3">{schedule.primaryAssessor?.name || schedule.primaryAssessor?.email || '-'}</td>
                  <td className="p-3">{schedule.secondaryAssessor?.name || schedule.secondaryAssessor?.email || '-'}</td>
                  <td className="p-3">{schedule.location || '-'}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        schedule.status === 'COMPLETED'
                          ? 'bg-green-50 text-green-700'
                          : schedule.status === 'CANCELLED'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {schedule.status}
                    </span>
                  </td>
                  <td className="space-x-2 p-3">
                    {schedule.status === 'SCHEDULED' ? (
                      <button onClick={() => handleStartEvaluation(schedule.id)} className="text-sm font-medium text-green-600 hover:text-green-700">
                        Start Evaluation
                      </button>
                    ) : null}
                    <button onClick={() => handleEdit(schedule)} className="text-sm font-medium text-[#175cc5] hover:text-[#114ca5]">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(schedule.id)} className="text-sm font-medium text-red-600 hover:text-red-700">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
