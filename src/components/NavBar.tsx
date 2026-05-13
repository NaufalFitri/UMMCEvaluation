import React from 'react'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

export default function NavBar({ name, email }: { name: string; email: string }) {
  return (
    <nav className="bg-white border-b p-4 flex justify-between items-center">
      <Link href="/dashboard" className="font-semibold">Radiograph Portal</Link>
      <div className="flex items-center space-x-4">
        <div className="text-sm">
          <div>{name}</div>
          <div className="text-gray-500">{email}</div>
        </div>
        <UserButton />
      </div>
    </nav>
  )
}
