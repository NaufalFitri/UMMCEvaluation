'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'

interface Section {
  slug: string
  label: string
  order: number
}

interface EvaluationSectionNavProps {
  sections: Section[]
  evaluationId: string
}

export default function EvaluationSectionNav({
  sections,
  evaluationId,
}: EvaluationSectionNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const currentSection = pathname.split('/').pop()

  const currentIndex = sections.findIndex((s) => s.slug === currentSection)
  const canGoPrevious = currentIndex > 0
  const canGoNext = currentIndex < sections.length - 1

  const goToPrevious = () => {
    if (canGoPrevious) {
      router.push(`/evaluations/${evaluationId}/${sections[currentIndex - 1].slug}`)
    }
  }

  const goToNext = () => {
    if (canGoNext) {
      router.push(`/evaluations/${evaluationId}/${sections[currentIndex + 1].slug}`)
    }
  }

  return (
    <div className="w-64 bg-gradient-to-b from-amber-900 to-amber-950 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-amber-800">
        <h2 className="text-lg font-semibold">Assessment Progress</h2>
        <p className="text-sm text-amber-200 mt-1">
          Step {currentIndex + 1} of {sections.length}
        </p>
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sections.map((section) => {
          const isActive = section.slug === currentSection
          const isCompleted = currentIndex > section.order - 1

          return (
            <Link
              key={section.slug}
              href={`/evaluations/${evaluationId}/${section.slug}`}
              className={`block p-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500 text-amber-900 font-semibold'
                  : isCompleted
                  ? 'bg-amber-700 hover:bg-amber-600 text-amber-50'
                  : 'bg-amber-800/50 hover:bg-amber-700 text-amber-100'
              }`}
            >
              <div className="flex items-center gap-2">
                {isCompleted && <Check className="w-4 h-4 flex-shrink-0" />}
                <span className={`text-sm whitespace-pre-wrap`}>
                  {section.label}
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="p-4 border-t border-amber-800 space-y-2">
        <button
          onClick={goToPrevious}
          disabled={!canGoPrevious}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
            canGoPrevious
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-amber-800/30 text-amber-400 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <button
          onClick={goToNext}
          disabled={!canGoNext}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
            canGoNext
              ? 'bg-amber-500 hover:bg-amber-400 text-amber-950'
              : 'bg-amber-800/30 text-amber-400 cursor-not-allowed'
          }`}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
