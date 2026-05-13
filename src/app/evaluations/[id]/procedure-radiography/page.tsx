'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function ProcedureRadiographyPage() {
  const [formData, setFormData] = useState({
    procedures: [] as string[],
    technique: '',
    notes: '',
  })

  const procedures = [
    'Intraoral - Periapical (PA)',
    'Intraoral - Bitewings (BW)',
    'Intraoral - Occlusal',
    'Extraoral - Panoramic',
    'Extraoral - Cephalometric',
    'Extraoral - Lateral Jaw',
    'CBCT - Cone Beam CT',
    'Digital Photography',
  ]

  const techniques = [
    'Digital sensor',
    'Film - Periapical size 0',
    'Film - Periapical size 1',
    'Film - Periapical size 2',
    'Film - Occlusal size 0',
    'Film - Occlusal size 1',
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
          Procedure Radiography
        </h1>
        <p className="text-gray-600">
          Document the radiographic procedures and techniques used in this examination.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Procedures Performed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Procedures Performed
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {procedures.map((proc) => (
              <label key={proc} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-50">
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

        {/* Imaging Technique */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imaging Technique & Media
          </label>
          <select
            value={formData.technique}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, technique: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Select imaging technique...</option>
            {techniques.map((tech) => (
              <option key={tech} value={tech}>
                {tech}
              </option>
            ))}
          </select>
        </div>

        {/* Clinical Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Clinical Notes & Observations
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Document any relevant clinical observations or findings"
            rows={4}
          />
        </div>

        {/* Summary */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-2">Summary</h3>
          <p className="text-amber-800 text-sm">
            {formData.procedures.length > 0
              ? `${formData.procedures.length} procedure(s) documented using ${formData.technique || 'unspecified technique'}`
              : 'No procedures selected yet'}
          </p>
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
