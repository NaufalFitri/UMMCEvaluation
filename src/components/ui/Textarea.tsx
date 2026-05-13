import React from 'react'

export default function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="border border-slate-300 p-2.5 rounded-md w-full bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" {...props} />
}
