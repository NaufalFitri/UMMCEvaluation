import React from 'react'

export default function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="border p-2 rounded w-full" {...props} />
}
