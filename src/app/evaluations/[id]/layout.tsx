'use client'

import { useParams } from 'next/navigation'
import EvaluationSectionNav from '@/components/EvaluationSectionNav'

const SECTIONS = [
  { slug: 'pre-procedure-checklist', label: 'Pre-Procedure\nChecklist', order: 1 },
  { slug: 'image-critique', label: 'Image\nCritique', order: 2 },
  { slug: 'procedure-radiography', label: 'Procedure\nRadiography', order: 3 },
  { slug: 'post-care-comments', label: 'Post-Care &\nComments', order: 4 },
  { slug: 'penilai-kedua-summary', label: 'Penilai Kedua\nSummary', order: 5 },
  { slug: 'piawan-imej', label: 'Piawan Imej\nOleh Penilai', order: 6 },
  { slug: 'discussion', label: 'Discussion', order: 7 },
  { slug: 'final-result', label: 'Final\nResult', order: 8 },
  { slug: 'history-summary', label: 'History &\nSummary', order: 9 },
]

export default function EvaluationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const evaluationId = params.id as string

  return (
    <div className="flex h-screen bg-gray-50">
      <EvaluationSectionNav
        sections={SECTIONS}
        evaluationId={evaluationId}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
