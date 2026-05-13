import React from 'react'
import Sidebar from './Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-gray-50 min-h-screen">
        <header className="bg-white border-b p-4 flex justify-between items-center">
          <div className="text-lg font-semibold">Radiograph Student Evaluation</div>
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
