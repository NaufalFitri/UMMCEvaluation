'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function PenilaiKeduaSummaryPage() {
  const [formData, setFormData] = useState({
    secondAssessorName: '',
    assessmentDate: '',
    findings: '',
    agreement: 'partial',
    notes: '',
  })

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Penilai Kedua Summary
        </h1>
        <p className="text-gray-600">
          Second assessor evaluation and comparison with initial assessment.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Second Assessor Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Second Assessor Name
          </label>
          <input
            type="text"
            value={formData.secondAssessorName}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                secondAssessorName: e.target.value,
              }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Enter second assessor name"
          />
        </div>

        {/* Assessment Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assessment Date
          </label>
          <input
            type="date"
            value={formData.assessmentDate}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                assessmentDate: e.target.value,
              }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Key Findings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Key Assessment Findings
          </label>
          <textarea
            value={formData.findings}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                findings: e.target.value,
              }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Summarize the key findings from the second assessment"
            rows={4}
          />
        </div>

        {/* Agreement Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Agreement with Initial Assessment
          </label>
          <div className="space-y-2">
            {['full', 'partial', 'disagreement'].map((level) => (
              <label key={level} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="agreement"
                  value={level}
                  checked={formData.agreement === level}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, agreement: e.target.value }))
                  }
                  className="w-4 h-4 text-amber-600"
                />
                <span className="text-gray-700 capitalize">
                  {level === 'full'
                    ? 'Fully Agree'
                    : level === 'partial'
                    ? 'Partially Agree'
                    : 'Disagree'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                notes: e.target.value,
              }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Any discrepancies or additional comments..."
            rows={3}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline">Save as Draft</Button>
          <Button className="bg-amber-600 hover:bg-amber-700">
            Save & Continue
          </Button>
        </div>
      </Card>
    </div>
  )
}
