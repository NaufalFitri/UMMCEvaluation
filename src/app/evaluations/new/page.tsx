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

      // Redirect to first section
      router.push(`/evaluations/${id}/pre-procedure-checklist`)
    } catch (error) {
      console.error('Error creating evaluation:', error)
      alert('Failed to create evaluation')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">New Evaluation</h1>
        <p className="text-gray-600 mb-6">
          Start a new radiograph assessment for a student.
        </p>

        <div className="space-y-4">
          {/* Student Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Student
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter Student ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Info Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900">
              <strong>Note:</strong> You'll proceed through 9 assessment sections.
              Each section can be saved as draft or completed.
            </p>
          </div>

          {/* Start Button */}
          <Button
            onClick={handleStartEvaluation}
            disabled={!studentId || isLoading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Creating...' : 'Start Assessment'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </Button>

          {/* Back Link */}
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="w-full"
          >
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  )
}
