import React from 'react'

export default function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="border p-2 rounded w-full" {...props} />
}
