import Link from 'next/link'
import React from 'react'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import LogoutButton from './LogoutButton'

export default async function Sidebar() {
  const { userId } = auth()
  let isAdmin = false

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    })
    isAdmin = user?.role === UserRole.ADMIN
  }

  const items = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/evaluations/new', label: 'New Assessment' },
    { href: '/dashboard', label: 'History' },
    { href: '/', label: 'Reports' },
    { href: '/', label: 'Help' },
  ]

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-gradient-to-b from-[#08325b] to-[#042645] text-white min-h-screen sticky top-0 shadow-xl">
      <div className="p-6 border-b border-blue-900/60">
        <div className="h-10 w-10 rounded-lg bg-white/10 mb-3" />
        <div className="text-xl font-semibold tracking-tight">Clinical Evaluation</div>
        <div className="text-sm text-blue-200">Penilaian Klinikal</div>
      </div>

      <nav className="p-4 space-y-1">
        {items.map((item) => (
          <Link
            key={item.label}
            className="flex items-center gap-3 py-2.5 px-3 rounded-md text-blue-100 hover:text-white hover:bg-blue-800/60 transition"
            href={item.href}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-300" />
            {item.label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="border-t border-blue-900/60 my-2" />
            <Link
              className="flex items-center gap-3 py-2.5 px-3 rounded-md text-blue-100 hover:text-white hover:bg-blue-800/60 transition"
              href="/admin"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-purple-300" />
              Admin Panel
            </Link>
          </>
        )}
      </nav>

      <div className="mt-auto p-4 space-y-3 border-t border-blue-900/60">
        <LogoutButton />
        <div className="text-xs text-blue-200">All rights reserved</div>
      </div>
    </aside>
  )
}
