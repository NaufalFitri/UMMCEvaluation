'use client'

import { useState } from 'react'
import { Card } from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import { Calendar, User } from 'lucide-react'

export default function HistorySummaryPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    )
  }

  // Mock data - in real app would come from database
  const history = [
    {
      id: 'section-1',
      name: 'Pre-Procedure Checklist',
      completed: true,
      date: '2024-05-13 10:30 AM',
      assessor: 'Dr. Smith',
    },
    {
      id: 'section-2',
      name: 'Image Critique',
      completed: true,
      date: '2024-05-13 10:45 AM',
      assessor: 'Dr. Smith',
    },
    {
      id: 'section-3',
      name: 'Procedure Radiography',
      completed: true,
      date: '2024-05-13 11:00 AM',
      assessor: 'Dr. Smith',
    },
    {
      id: 'section-4',
      name: 'Post-Care & General Comments',
      completed: true,
      date: '2024-05-13 11:15 AM',
      assessor: 'Dr. Smith',
    },
  ]

  const completionPercentage = Math.round((history.filter(h => h.completed).length / history.length) * 100)

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          History & Summary
        </h1>
        <p className="text-gray-600">
          Complete history of assessment sections and evaluation progress.
        </p>
      </div>

      <div className="space-y-6">
        {/* Progress Summary */}
        <Card className="p-6 bg-gradient-to-r from-amber-50 to-amber-100">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Overall Progress
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Sections Completed</span>
                  <span className="text-2xl font-bold text-amber-600">
                    {completionPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-amber-500 h-3 rounded-full transition-all"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="bg-white rounded-lg p-3 border border-amber-200">
                <p className="text-xs text-gray-600">Total Sections</p>
                <p className="text-2xl font-bold text-amber-600">9</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <p className="text-xs text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {history.filter(h => h.completed).length}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-gray-600">
                  {history.length - history.filter(h => h.completed).length}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Detailed History */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Section Completion History
          </h3>
          <div className="space-y-2">
            {history.map((item) => (
              <Card
                key={item.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => toggleSection(item.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        item.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <h4 className="font-semibold text-gray-900">
                        {item.name}
                      </h4>
                      {item.completed && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`transform transition-transform ${
                    expandedSections.includes(item.id) ? 'rotate-180' : ''
                  }`}>
                    ▼
                  </span>
                </div>

                {expandedSections.includes(item.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{item.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>Assessed by: {item.assessor}</span>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Summary Statistics */}
        <Card className="p-6 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-4">Assessment Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Started on</p>
              <p className="font-semibold text-gray-900">
                2024-05-13 10:30 AM
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last updated</p>
              <p className="font-semibold text-gray-900">
                2024-05-13 11:15 AM
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total duration</p>
              <p className="font-semibold text-gray-900">~45 minutes</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Primary assessor</p>
              <p className="font-semibold text-gray-900">Dr. Smith</p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">Export Report</Button>
          <Button className="bg-amber-600 hover:bg-amber-700">
            Review Complete Assessment
          </Button>
        </div>
      </div>
    </div>
  )
}
