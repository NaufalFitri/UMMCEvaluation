import { UserRole } from '@prisma/client'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'

export async function getOrCreatePortalUser(clerkUserId: string) {
  const existing = await prisma.user.findUnique({ where: { clerkId: clerkUserId } })
  if (existing) return existing

  const clerk = await currentUser()
  if (!clerk) throw new Error('UNAUTHENTICATED')

  const primaryEmail =
    clerk.emailAddresses.find((e: { id: string; emailAddress: string }) => e.id === clerk.primaryEmailAddressId)?.emailAddress ??
    clerk.emailAddresses[0]?.emailAddress

  if (!primaryEmail) throw new Error('NO_EMAIL')

  const derivedName =
    [clerk.firstName, clerk.lastName].filter(Boolean).join(' ') ||
    clerk.username ||
    primaryEmail.split('@')[0]

  const byEmail = await prisma.user.findUnique({ where: { email: primaryEmail } })
  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: {
        clerkId: clerkUserId,
        name: derivedName,
      },
    })
  }

  // Default new portal users as assessor to avoid sign-in dead-end in first-run environments.
  return prisma.user.create({
    data: {
      clerkId: clerkUserId,
      email: primaryEmail,
      name: derivedName,
      role: UserRole.ASSESSOR,
    },
  })
}
