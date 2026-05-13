import React from 'react'
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
          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            {evaluation.status}
          </span>
          <Link href={`/evaluations/${evaluation.id}`} className="text-blue-600 underline">View</Link>
        </div>
      </div>
    </div>
  )
}
