import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '../../lib/prisma'
import NavBar from '../../components/NavBar'
import { UserRole } from '@prisma/client'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) redirect('/sign-in?error=no_account')
  if (user.role !== UserRole.ASSESSOR) redirect('/?error=unauthorized')

  return (
    <div>
      <NavBar name={user.name ?? ''} email={user.email} />
      <main className="p-6">{children}</main>
    </div>
  )
}
