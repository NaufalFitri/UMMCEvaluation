import React from 'react'
import fs from 'fs'
import path from 'path'
import Link from 'next/link'

const WAITLIST_FILE = path.join(process.cwd(), 'data', 'waitlist.json')

function readWaitlist() {
  if (!fs.existsSync(WAITLIST_FILE)) return []
  try {
    return JSON.parse(fs.readFileSync(WAITLIST_FILE, 'utf8') || '[]')
  } catch (e) {
    return []
  }
}

export default function WaitlistAdminPage() {
  const list = readWaitlist()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Pending Waitlist Entries</h2>
          <p className="text-sm text-slate-500">Approve users from Clerk waitlist here (or via Clerk console).</p>
        </div>
        <Link href="/admin" className="px-4 py-2 bg-[#175cc5] text-white rounded-md">Back</Link>
      </div>

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
                    <a className="text-[#175cc5] hover:text-[#114ca5]" href={`mailto:${entry.email}?subject=Your account request`}>Email</a>
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
