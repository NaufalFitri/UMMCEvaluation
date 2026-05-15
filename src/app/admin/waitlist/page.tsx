import React from 'react'
import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { getOrCreatePortalUser } from '@/lib/auth-user'
import { UserRole } from '@prisma/client'

const WAITLIST_FILE = path.join(process.cwd(), 'data', 'waitlist.json')

function readWaitlist() {
  if (!fs.existsSync(WAITLIST_FILE)) return []
  try {
    return JSON.parse(fs.readFileSync(WAITLIST_FILE, 'utf8') || '[]')
  } catch (e) {
    return []
  }
}

function writeWaitlist(list: any[]) {
  const dir = path.dirname(WAITLIST_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(WAITLIST_FILE, JSON.stringify(list, null, 2))
}

export default function WaitlistAdminPage({
  searchParams,
}: {
  searchParams?: { approved?: string; invited?: string; error?: string }
}) {
  const list = readWaitlist()

  async function approveWaitlistEntry(formData: FormData) {
    'use server'

    const { userId } = auth()
    if (!userId) {
      redirect('/sign-in')
    }

    const currentUser = await getOrCreatePortalUser(userId)
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      redirect('/admin/waitlist?error=unauthorized')
    }

    const email = String(formData.get('email') || '').trim().toLowerCase()
    const name = String(formData.get('name') || '').trim()
    if (!email) {
      redirect('/admin/waitlist')
    }

    try {
      await clerkClient().invitations.createInvitation({
        emailAddress: email,
        notify: true,
        ignoreExisting: true,
        publicMetadata: name ? { waitlistName: name } : undefined,
      })

      const current = readWaitlist()
      const updated = current.filter((entry: any) => String(entry.email || '').toLowerCase() !== email)
      writeWaitlist(updated)

      redirect('/admin/waitlist?approved=1&invited=1')
    } catch (error) {
      console.error('Failed to create Clerk invitation:', error)
      redirect('/admin/waitlist?error=clerk-invite-failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Pending Waitlist Entries</h2>
          <p className="text-sm text-slate-500">Approve users from Clerk waitlist here (or via Clerk console).</p>
        </div>
        <Link href="/admin" className="px-4 py-2 bg-[#175cc5] text-white rounded-md">Back</Link>
      </div>

      {searchParams?.approved === '1' ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {searchParams?.invited === '1'
            ? 'Waitlist entry approved, Clerk invitation sent, and pending entry removed.'
            : 'Waitlist entry approved and removed from pending list.'}
        </div>
      ) : null}

      {searchParams?.error === 'clerk-invite-failed' ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to send Clerk invitation. Please verify Clerk keys and try again.
        </div>
      ) : null}

      {searchParams?.error === 'unauthorized' ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          You are not authorized to approve waitlist entries.
        </div>
      ) : null}

      {list.length === 0 ? (
        <div className="p-6 bg-white rounded-xl border shadow-sm text-center">No pending waitlist entries.</div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full table-auto">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-left text-xs text-slate-500">Email</th>
                <th className="p-3 text-left text-xs text-slate-500">Name</th>
                <th className="p-3 text-left text-xs text-slate-500">Requested</th>
                <th className="p-3 text-left text-xs text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((entry: any) => (
                <tr key={entry.email} className="border-t">
                  <td className="p-3">{entry.email}</td>
                  <td className="p-3">{entry.name || '-'}</td>
                  <td className="p-3 text-sm text-slate-500">{new Date(entry.createdAt).toLocaleString()}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <form action={approveWaitlistEntry}>
                        <input type="hidden" name="email" value={entry.email} />
                        <input type="hidden" name="name" value={entry.name || ''} />
                        <button
                          type="submit"
                          className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                        >
                          Approve
                        </button>
                      </form>
                      <a className="text-[#175cc5] hover:text-[#114ca5]" href={`mailto:${entry.email}?subject=Your account request`}>
                        Email
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
