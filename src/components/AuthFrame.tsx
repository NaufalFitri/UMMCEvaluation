import React from 'react'

export default function AuthFrame({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#f2f6fd]">
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-b from-[#08325b] via-[#0a3c70] to-[#042645] text-white p-12">
        <div className="absolute -top-24 -left-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="relative z-10 max-w-md">
          <div className="text-xs uppercase tracking-[0.2em] text-blue-200 mb-4">Clinical Evaluation Platform</div>
          <h1 className="text-4xl font-semibold leading-tight mb-4">Radiograph Assessment Portal</h1>
          <p className="text-blue-100 leading-relaxed">
            Structured, guided and objective clinical evaluation workflows for assessor teams.
          </p>

          <div className="mt-10 rounded-xl border border-blue-300/20 bg-white/10 p-4 backdrop-blur">
            <div className="text-sm text-blue-100">Trusted workflow</div>
            <div className="mt-2 text-2xl font-semibold">12-step assessment</div>
            <div className="text-sm text-blue-200 mt-1">Patient info, checklist, image critique, summary</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">University Clinical System</div>
            <h2 className="text-2xl font-semibold text-slate-900 mt-2">{title}</h2>
            <p className="text-slate-500 mt-1">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
