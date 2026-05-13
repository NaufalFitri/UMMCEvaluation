import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { UserRole } from '@prisma/client'
import { getOrCreatePortalUser } from '../../lib/auth-user'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const user = await getOrCreatePortalUser(userId)
  if (user.role !== UserRole.ASSESSOR) redirect('/?error=unauthorized')

  return <>{children}</>
}
