'use client'

import React, { useState, useEffect } from 'react'
import { formatDateISO } from '@/lib/utils'

interface Student {
  id: string
  studentId: string
  name: string
  email: string
  createdAt: Date
}

export default function StudentManagementPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [])

  async function fetchStudents() {
    try {
      const res = await fetch('/api/admin/students')
      const data = await res.json()
      setStudents(data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load students')
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/students/${editingId}` : '/api/admin/students'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save student')
      }

      await fetchStudents()
      setShowForm(false)
      setEditingId(null)
      setFormData({ studentId: '', name: '', email: '' })
      setSuccess(editingId ? 'Student updated successfully' : 'Student added successfully')
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this student?')) return

    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete student')

      await fetchStudents()
      setSuccess('Student deleted successfully')
    } catch (err: any) {
      setError(err.message)
    }
  }

  function handleEdit(student: Student) {
    setFormData({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
    })
    setEditingId(student.id)
    setShowForm(true)
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Student Management</h2>
          <p className="text-sm text-slate-500">Add and manage student records</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm)
            if (showForm) {
              setEditingId(null)
              setFormData({ studentId: '', name: '', email: '' })
            }
          }}
          className="px-4 py-2 bg-[#175cc5] hover:bg-[#114ca5] text-white rounded-md transition"
        >
          {showForm ? 'Cancel' : '+ Add Student'}
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</div>}
      {success && <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">{success}</div>}

      {showForm && (
        <div className="p-6 bg-white rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Student' : 'Add New Student'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Student ID</label>
              <input
                type="text"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#175cc5]"
                placeholder="e.g., STU001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#175cc5]"
                placeholder="Student name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#175cc5]"
                placeholder="student@example.com"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#175cc5] hover:bg-[#114ca5] text-white rounded-md transition"
            >
              {editingId ? 'Update Student' : 'Add Student'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {students.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-slate-500">No students found. Add one to get started.</p>
          </div>
        ) : (
          <table className="w-full table-auto">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Student ID</th>
                <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Name</th>
                <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Email</th>
                <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Created</th>
                <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-t hover:bg-slate-50">
                  <td className="p-3 font-medium">{student.studentId}</td>
                  <td className="p-3">{student.name}</td>
                  <td className="p-3">{student.email}</td>
                  <td className="p-3 text-sm text-slate-500">{formatDateISO(new Date(student.createdAt))}</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => handleEdit(student)}
                      className="text-[#175cc5] hover:text-[#114ca5] font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
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
