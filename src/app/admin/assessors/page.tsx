'use client'

import React, { useState, useEffect } from 'react'
import { formatDateISO } from '@/lib/utils'
import SectionBulkUpload from '@/components/admin/SectionBulkUpload'

interface Assessor {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: Date
}

export default function AssessorManagementPage() {
  const [assessors, setAssessors] = useState<Assessor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'ASSESSOR',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchAssessors()
  }, [])

  async function fetchAssessors() {
    try {
      const res = await fetch('/api/admin/assessors')
      const data = await res.json()
      setAssessors(data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load assessors')
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.email) {
      setError('Email is required')
      return
    }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/assessors/${editingId}` : '/api/admin/assessors'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save assessor')
      }

      await fetchAssessors()
      setShowForm(false)
      setEditingId(null)
      setFormData({ email: '', name: '', role: 'ASSESSOR' })
      setSuccess(editingId ? 'Assessor updated successfully' : 'Assessor added successfully')
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this assessor?')) return

    try {
      const res = await fetch(`/api/admin/assessors/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete assessor')

      await fetchAssessors()
      setSuccess('Assessor deleted successfully')
    } catch (err: any) {
      setError(err.message)
    }
  }

  function handleEdit(assessor: Assessor) {
    setFormData({
      email: assessor.email,
      name: assessor.name || '',
      role: assessor.role,
    })
    setEditingId(assessor.id)
    setShowForm(true)
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Assessor Management</h2>
          <p className="text-sm text-slate-500">Add and manage assessor accounts</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm)
            if (showForm) {
              setEditingId(null)
              setFormData({ email: '', name: '', role: 'ASSESSOR' })
            }
          }}
          className="px-4 py-2 bg-[#175cc5] hover:bg-[#114ca5] text-white rounded-md transition"
        >
          {showForm ? 'Cancel' : '+ Add Assessor'}
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</div>}
      {success && <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">{success}</div>}

      <SectionBulkUpload
        target="assessors"
        title="Bulk Upload Assessors"
        description="Upload one Excel file for assessors only from this page."
        sheetName="Assessors"
        columns={['email', 'name']}
        sampleRows={[
          { email: 'assessor1@university.edu', name: 'Dr. Ahmad Ali' },
          { email: 'assessor2@university.edu', name: 'Prof. Siti Nur' },
        ]}
        onUploaded={fetchAssessors}
      />

      {showForm && (
        <div className="p-6 bg-white rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Assessor' : 'Add New Assessor'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#175cc5]"
                placeholder="assessor@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#175cc5]"
                placeholder="Assessor name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#175cc5]"
              >
                <option value="ASSESSOR">Assessor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#175cc5] hover:bg-[#114ca5] text-white rounded-md transition"
            >
              {editingId ? 'Update Assessor' : 'Add Assessor'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {assessors.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-slate-500">No assessors found. Add one to get started.</p>
          </div>
        ) : (
          <table className="w-full table-auto">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Email</th>
                <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Name</th>
                <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Role</th>
                <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Created</th>
                <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessors.map((assessor) => (
                <tr key={assessor.id} className="border-t hover:bg-slate-50">
                  <td className="p-3 font-medium">{assessor.email}</td>
                  <td className="p-3">{assessor.name || '-'}</td>
                  <td className="p-3">
                    <span className={assessor.role === 'ADMIN' ? 'inline-flex rounded-full bg-purple-50 text-purple-700 px-2.5 py-1 text-xs font-semibold' : 'inline-flex rounded-full bg-blue-50 text-blue-700 px-2.5 py-1 text-xs font-semibold'}>
                      {assessor.role}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-slate-500">{formatDateISO(new Date(assessor.createdAt))}</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => handleEdit(assessor)}
                      className="text-[#175cc5] hover:text-[#114ca5] font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(assessor.id)}
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
