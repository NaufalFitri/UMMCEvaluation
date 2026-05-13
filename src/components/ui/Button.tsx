import React from 'react'

export default function Button({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const disabled = props.disabled
  return (
    <button
      className={`inline-flex items-center justify-center px-4 py-2.5 rounded-md bg-[#175cc5] hover:bg-[#114ca5] text-white font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      {...props}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
