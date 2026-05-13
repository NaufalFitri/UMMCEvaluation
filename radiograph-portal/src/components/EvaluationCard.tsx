import React from 'react'
import Badge from './ui/Badge'
import Link from 'next/link'
import { formatDateISO } from '../lib/utils'

export default function EvaluationCard({ evaluation }: { evaluation: any }) {
  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-gray-500">{formatDateISO(evaluation.createdAt)}</div>
          <div className="font-medium">{evaluation.student.name} — {evaluation.student.studentId}</div>
        </div>
        <div className="space-x-2">
          <Badge rating={evaluation.exposureRating} />
          <Link href={`/evaluations/${evaluation.id}`} className="text-blue-600 underline">View</Link>
        </div>
      </div>
    </div>
  )
}
