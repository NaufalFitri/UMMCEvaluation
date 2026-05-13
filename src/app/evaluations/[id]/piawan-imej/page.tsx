'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function PiawanImejPage() {
  const [formData, setFormData] = useState({
    imageQuality: 'acceptable',
    anatomicalStructures: [] as string[],
    observations: '',
  })

  const structures = [
    'Crowns & Bridges',
    'Root Canals & Restoration',
    'Bone Levels & Density',
    'Implants & Fixtures',
    'Periodontal Assessment',
    'Caries Detection',
    'Trauma & Fractures',
    'Pathologies',
  ]

  const toggleStructure = (struct: string) => {
    setFormData((prev) => ({
      ...prev,
      anatomicalStructures: prev.anatomicalStructures.includes(struct)
        ? prev.anatomicalStructures.filter((s) => s !== struct)
        : [...prev.anatomicalStructures, struct],
    }))
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Piawan Imej Oleh Penilai
        </h1>
        <p className="text-gray-600">
          Image panel review and anatomical structure assessment by assessor.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Image Preview Grid */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Image Panel Preview
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
              >
                <span className="text-gray-400">Image {i}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Image Quality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Overall Image Quality
          </label>
          <div className="space-y-2">
            {['excellent', 'acceptable', 'poor'].map((quality) => (
              <label key={quality} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="quality"
                  value={quality}
                  checked={formData.imageQuality === quality}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      imageQuality: e.target.value,
                    }))
                  }
                  className="w-4 h-4 text-amber-600"
                />
                <span className="text-gray-700 capitalize">{quality}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Anatomical Structures Assessed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Anatomical Structures Assessed
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {structures.map((struct) => (
              <label key={struct} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.anatomicalStructures.includes(struct)}
                  onChange={() => toggleStructure(struct)}
                  className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-gray-700">{struct}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Observations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Detailed Observations
          </label>
          <textarea
            value={formData.observations}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                observations: e.target.value,
              }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Document specific observations about each anatomical structure..."
            rows={4}
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
