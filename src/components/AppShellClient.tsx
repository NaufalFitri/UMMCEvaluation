'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

export default function AppShellClient({ 
  children, 
  sidebar 
}: { 
  children: React.ReactNode
  sidebar: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up') || pathname === '/'
  const isAdminPage = pathname?.startsWith('/admin')

  if (isAuthPage || isAdminPage) {
    return <div className="min-h-screen bg-slate-50">{children}</div>
  }

  return (
    <div className="flex min-h-screen bg-[#f3f6fb]">
      {sidebar}
      <div className="flex-1">
        <header className="bg-white/90 backdrop-blur border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">Clinical Evaluation System</div>
            <div className="text-lg font-semibold text-slate-800">Radiograph Student Evaluation</div>
          </div>
        </header>
        <div className="p-6 lg:p-8">{children}</div>
      </div>
    </div>
  )
}
