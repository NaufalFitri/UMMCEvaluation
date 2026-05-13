'use client'

import { useState } from 'react'
import { Card } from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'

export default function DiscussionPage() {
  const [formData, setFormData] = useState({
    clinicalSignificance: '',
    patientConsiderations: '',
    treatmentImplications: '',
    researchNotes: '',
  })

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Discussion
        </h1>
        <p className="text-gray-600">
          Provide comprehensive discussion of findings and clinical implications.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Clinical Significance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Clinical Significance of Findings
          </label>
          <textarea
            value={formData.clinicalSignificance}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                clinicalSignificance: e.target.value,
              }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Discuss the clinical importance and implications of the radiographic findings..."
            rows={4}
          />
        </div>

        {/* Patient Considerations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Patient-Specific Considerations
          </label>
          <textarea
            value={formData.patientConsiderations}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                patientConsiderations: e.target.value,
              }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Age, medical history, symptoms, or other relevant patient factors..."
            rows={4}
          />
        </div>

        {/* Treatment Implications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Treatment Implications & Recommendations
          </label>
          <textarea
            value={formData.treatmentImplications}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                treatmentImplications: e.target.value,
              }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="How do these findings affect treatment planning and patient management..."
            rows={4}
          />
        </div>

        {/* Research/Educational Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Research & Educational Notes
          </label>
          <textarea
            value={formData.researchNotes}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                researchNotes: e.target.value,
              }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Any relevant literature references, learning points, or educational value..."
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
