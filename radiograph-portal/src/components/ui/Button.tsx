import React from 'react'

export default function Button({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center px-3 py-2 bg-primary text-white rounded ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
