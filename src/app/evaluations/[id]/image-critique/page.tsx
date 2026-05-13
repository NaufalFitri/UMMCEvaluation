'use client'

import { useState } from 'react'
import { Card } from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import { Slider } from '../../../../components/ui/Slider'

export default function ImageCritiquePage() {
  const [formData, setFormData] = useState({
    positioning: 50,
    contrast: 50,
    clarity: 50,
    comments: '',
    criticalIssues: [] as string[],
  })

  const issues = [
    'Patient movement artifact',
    'Improper collimation',
    'Incorrect exposure',
    'Positioning error',
    'Foreign objects in field',
    'Other',
  ]

  const toggleIssue = (issue: string) => {
    setFormData((prev) => ({
      ...prev,
      criticalIssues: prev.criticalIssues.includes(issue)
        ? prev.criticalIssues.filter((i) => i !== issue)
        : [...prev.criticalIssues, issue],
    }))
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Image Critique
        </h1>
        <p className="text-gray-600">
          Evaluate the quality and technical aspects of the radiographic image.
        </p>
      </div>

      <Card className="p-6 space-y-8">
        {/* Image Preview */}
        <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center h-64 border-2 border-dashed border-gray-300">
          <div className="text-center">
            <p className="text-gray-500 text-lg">Radiograph Preview</p>
            <p className="text-gray-400 text-sm mt-1">(Image upload to be implemented)</p>
          </div>
        </div>

        {/* Quality Ratings */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Positioning Quality
              </label>
              <span className="text-sm font-semibold text-amber-600">
                {formData.positioning}%
              </span>
            </div>
            <Slider
              value={[formData.positioning]}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, positioning: value[0] }))
              }
              min={0}
              max={100}
              step={5}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Contrast & Brightness
              </label>
              <span className="text-sm font-semibold text-amber-600">
                {formData.contrast}%
              </span>
            </div>
            <Slider
              value={[formData.contrast]}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, contrast: value[0] }))
              }
              min={0}
              max={100}
              step={5}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Image Clarity & Sharpness
              </label>
              <span className="text-sm font-semibold text-amber-600">
                {formData.clarity}%
              </span>
            </div>
            <Slider
              value={[formData.clarity]}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, clarity: value[0] }))
              }
              min={0}
              max={100}
              step={5}
            />
          </div>
        </div>

        {/* Critical Issues */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Critical Issues Identified
          </label>
          <div className="space-y-2">
            {issues.map((issue) => (
              <label key={issue} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.criticalIssues.includes(issue)}
                  onChange={() => toggleIssue(issue)}
                  className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-gray-700">{issue}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Detailed Comments
          </label>
          <textarea
            value={formData.comments}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, comments: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Provide detailed feedback on the image quality"
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
