import React from 'react'

export default function Badge({ rating }: { rating: string }) {
  const cls =
    rating === 'OPTIMAL'
      ? 'bg-green-50 text-green-700 border border-green-200'
      : rating === 'UNDER_EXPOSED'
        ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
        : 'bg-red-50 text-red-700 border border-red-200'

  return <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>{rating.replaceAll('_', ' ')}</span>
}
