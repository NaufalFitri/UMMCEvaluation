'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function PostCareCommentsPage() {
  const [formData, setFormData] = useState({
    postCareInstructions: '',
    generalComments: '',
    nextSteps: '',
  })

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Post-Care & General Comments
        </h1>
        <p className="text-gray-600">
          Document post-care instructions and provide general comments about the examination.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Post-Care Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post-Care Instructions for Patient
          </label>
          <textarea
            value={formData.postCareInstructions}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                postCareInstructions: e.target.value,
              }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="e.g., Continue fluoride therapy, schedule follow-up in 6 months, maintain oral hygiene..."
            rows={4}
          />
        </div>

        {/* General Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            General Comments & Observations
          </label>
          <textarea
            value={formData.generalComments}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                generalComments: e.target.value,
              }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Any additional observations or recommendations..."
            rows={4}
          />
        </div>

        {/* Next Steps */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recommended Next Steps
          </label>
          <textarea
            value={formData.nextSteps}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                nextSteps: e.target.value,
              }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="e.g., Referral to specialist, further imaging, treatment planning..."
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
