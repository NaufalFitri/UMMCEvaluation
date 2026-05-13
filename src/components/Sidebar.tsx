import Link from 'next/link'
import React from 'react'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#0b3a66] text-white min-h-screen sticky top-0">
      <div className="p-6 border-b border-blue-700">
        <div className="text-xl font-bold">Radiograph</div>
        <div className="text-sm text-blue-200">Evaluation System</div>
      </div>

      <nav className="p-4 space-y-2">
        <Link className="block py-2 px-3 rounded hover:bg-blue-700" href="/dashboard">Dashboard</Link>
        <Link className="block py-2 px-3 rounded hover:bg-blue-700" href="/evaluations/new">New Assessment</Link>
        <Link className="block py-2 px-3 rounded hover:bg-blue-700" href="/dashboard">History</Link>
        <Link className="block py-2 px-3 rounded hover:bg-blue-700" href="/">Reports</Link>
        <Link className="block py-2 px-3 rounded hover:bg-blue-700" href="/">Help</Link>
      </nav>
    </aside>
  )
}
