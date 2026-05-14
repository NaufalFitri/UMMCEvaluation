'use client'

import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function LogoutButton({ className }: { className?: string }) {
  const { signOut } = useClerk()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <button
      onClick={handleLogout}
      className={
        className ||
        'w-full px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-200 hover:text-red-100 rounded-md transition text-sm font-medium'
      }
    >
      Logout
    </button>
  )
}
