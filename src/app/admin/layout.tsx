import React from 'react'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { UserRole } from '@prisma/client'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import { getOrCreatePortalUser } from '@/lib/auth-user'
import fs from 'fs'
import path from 'path'

const WAITLIST_FILE = path.join(process.cwd(), 'data', 'waitlist.json')

function getWaitlistCount() {
  if (!fs.existsSync(WAITLIST_FILE)) return 0
  try {
    const raw = fs.readFileSync(WAITLIST_FILE, 'utf8')
    const list = JSON.parse(raw || '[]')
    return Array.isArray(list) ? list.length : 0
  } catch {
    return 0
  }
}

export const metadata = {
  title: 'Admin Panel - Clinical Evaluation System',
  description: 'Manage students and assessors',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = auth()
  if (!userId) {
    redirect('/sign-in')
  }

  // Check if user is admin (also provisions user if missing)
  const user = await getOrCreatePortalUser(userId)

  if (!user || user.role !== UserRole.ADMIN) {
    redirect('/dashboard')
  }

  const adminLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/waitlist', label: 'Waitlist' },
    { href: '/admin/bulk-upload', label: 'Bulk Upload' },
    { href: '/admin/schedules', label: 'Schedules' },
    { href: '/admin/students', label: 'Manage Students' },
    { href: '/admin/assessors', label: 'Manage Assessors' },
  ]
  const waitlistCount = getWaitlistCount()

  return (
    <div className="flex min-h-screen bg-[#f3f6fb]">
      {/* Admin Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-gradient-to-b from-[#1a4d7a] to-[#0d2a47] text-white min-h-screen sticky top-0 shadow-xl">
        <div className="p-6 border-b border-blue-700/60">
          <div className="text-xl font-semibold tracking-tight">Admin Panel</div>
          <div className="text-sm text-blue-200">System Management</div>
        </div>

        <nav className="p-4 space-y-1">
          {adminLinks.map((link) => (
            <Link
              key={link.label}
              className="flex items-center gap-3 py-2.5 px-3 rounded-md text-blue-100 hover:text-white hover:bg-blue-800/60 transition"
              href={link.href}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-300" />
              {link.label}
              {link.label === 'Waitlist' && waitlistCount > 0 ? (
                <span className="ml-auto rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-semibold text-slate-900">
                  {waitlistCount}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t border-blue-700/60">
          <div className="mb-3">
            <LogoutButton className="w-full px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-200 hover:text-red-100 rounded-md transition text-sm font-medium" />
          </div>
          <Link href="/dashboard" className="text-xs text-blue-200 hover:text-white">Back to Portal →</Link>
          <div className="text-xs text-blue-200 mt-3">Admin Account</div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <header className="bg-white/90 backdrop-blur border-b border-slate-200 px-6 py-4">
          <div className="text-xs uppercase tracking-wide text-slate-400">Admin Control Panel</div>
          <div className="text-lg font-semibold text-slate-800">System Management</div>
        </header>
        <div className="p-6 lg:p-8">{children}</div>
      </div>
    </div>
  )
}
