import React from 'react'

export default function Badge({ rating }: { rating: string }) {
  const cls = rating === 'OPTIMAL' ? 'bg-green-100 text-green-800' : rating === 'UNDER_EXPOSED' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
  return <span className={`px-2 py-1 rounded ${cls}`}>{rating.replaceAll('_', ' ')}</span>
}
