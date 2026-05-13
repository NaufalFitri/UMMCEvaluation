import React from 'react'

type ButtonVariant = 'default' | 'outline'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

function Button({ children, className = '', variant = 'default', ...props }: ButtonProps) {
  const disabled = props.disabled
  const variantClassName =
    variant === 'outline'
      ? 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
      : 'bg-[#175cc5] hover:bg-[#114ca5] text-white'

  return (
    <button
      className={`inline-flex items-center justify-center px-4 py-2.5 rounded-md font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ${variantClassName} ${className}`}
      {...props}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export { Button }
export default Button
