'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function PreProcedureChecklistPage() {
  const [formData, setFormData] = useState({
    patientId: '',
    caseName: '',
    procedures: [] as string[],
  })

  const procedures = [
    'Radiograph Equipment Check',
    'Patient ID Verification',
    'Consent Form Signed',
    'Protective Gear Applied',
    'Positioning Aids Ready',
    'Exposure Settings Verified',
  ]

  const toggleProcedure = (proc: string) => {
    setFormData((prev) => ({
      ...prev,
      procedures: prev.procedures.includes(proc)
        ? prev.procedures.filter((p) => p !== proc)
        : [...prev.procedures, proc],
    }))
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Pre-Procedure Checklist
        </h1>
        <p className="text-gray-600">
          Verify all prerequisites are completed before proceeding with the radiograph examination.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Patient Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient ID
            </label>
            <input
              type="text"
              value={formData.patientId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, patientId: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Enter patient ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Case Name/Description
            </label>
            <textarea
              value={formData.caseName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, caseName: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Brief description of the case"
              rows={3}
            />
          </div>

          {/* Procedure Checklist */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Checklist Items
            </label>
            <div className="space-y-3">
              {procedures.map((proc) => (
                <label key={proc} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.procedures.includes(proc)}
                    onChange={() => toggleProcedure(proc)}
                    className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-gray-700">{proc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Completion Status */}
          <div className="pt-4">
            <p className="text-sm text-gray-600">
              {formData.procedures.length} of {procedures.length} items completed
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{
                  width: `${(formData.procedures.length / procedures.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline">Save as Draft</Button>
            <Button className="bg-amber-600 hover:bg-amber-700">
              Save & Continue
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
