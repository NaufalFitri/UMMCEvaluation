'use client'

import { useState } from 'react'
import { Card } from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function FinalResultPage() {
  const [formData, setFormData] = useState({
    overallRating: 'pass',
    confidence: 'high',
    summary: '',
  })

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Final Result
        </h1>
        <p className="text-gray-600">
          Final assessment rating and overall evaluation summary.
        </p>
      </div>

      <div className="space-y-6">
        {/* Overall Rating */}
        <Card className="p-8 text-center border-2">
          <label className="block text-sm font-medium text-gray-700 mb-6">
            Overall Assessment Rating
          </label>
          <div className="space-y-3">
            {['pass', 'needs-review', 'fail'].map((rating) => (
              <label
                key={rating}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.overallRating === rating
                    ? rating === 'pass'
                      ? 'border-green-500 bg-green-50'
                      : rating === 'needs-review'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="rating"
                  value={rating}
                  checked={formData.overallRating === rating}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      overallRating: e.target.value,
                    }))
                  }
                  className="w-5 h-5"
                />
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    {rating === 'pass' && (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-900">PASS</span>
                      </>
                    )}
                    {rating === 'needs-review' && (
                      <>
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <span className="font-semibold text-amber-900">
                          NEEDS REVIEW
                        </span>
                      </>
                    )}
                    {rating === 'fail' && (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-red-900">FAIL</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {rating === 'pass' &&
                      'Assessment meets all criteria and standards'}
                    {rating === 'needs-review' &&
                      'Some areas need further review or clarification'}
                    {rating === 'fail' &&
                      'Assessment does not meet required standards'}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Confidence Level */}
        <Card className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Assessor Confidence Level
          </label>
          <div className="space-y-2">
            {['high', 'moderate', 'low'].map((level) => (
              <label key={level} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="confidence"
                  value={level}
                  checked={formData.confidence === level}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confidence: e.target.value,
                    }))
                  }
                  className="w-4 h-4 text-amber-600"
                />
                <span className="text-gray-700 capitalize">
                  {level === 'high'
                    ? 'High - Very confident in this assessment'
                    : level === 'moderate'
                    ? 'Moderate - Reasonably confident'
                    : 'Low - Requires further discussion/review'}
                </span>
              </label>
            ))}
          </div>
        </Card>

        {/* Summary */}
        <Card className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Final Summary & Justification
          </label>
          <textarea
            value={formData.summary}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                summary: e.target.value,
              }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Provide justification for the final rating based on all assessment findings..."
            rows={5}
          />
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">Save as Draft</Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            Complete Assessment
          </Button>
        </div>
      </div>
    </div>
  )
}
