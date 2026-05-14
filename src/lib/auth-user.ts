import { Prisma, UserRole } from '@prisma/client'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'

function isConfiguredAdminEmail(email?: string | null) {
  if (!email) return false
  const configured = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
  return configured.includes(email.toLowerCase())
}

export async function getOrCreatePortalUser(clerkUserId: string) {
  const existing = await prisma.user.findUnique({ where: { clerkId: clerkUserId } })
  if (existing) {
    const shouldBeAdmin = isConfiguredAdminEmail(existing.email)
    if (shouldBeAdmin && existing.role !== UserRole.ADMIN) {
      return prisma.user.update({
        where: { id: existing.id },
        data: { role: UserRole.ADMIN },
      })
    }
    return existing
  }

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
    const shouldBeAdmin = isConfiguredAdminEmail(primaryEmail)
    try {
      // Update existing user record (might have been pre-created by admin)
      return await prisma.user.update({
        where: { id: byEmail.id },
        data: {
          clerkId: clerkUserId,
          name: derivedName,
          role: shouldBeAdmin ? UserRole.ADMIN : byEmail.role,
        },
      })
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        // Unique constraint on clerkId — another process likely created it concurrently.
        const found = await prisma.user.findUnique({ where: { clerkId: clerkUserId } })
        if (found) return found
      }
      throw e
    }
  }

  // Default new portal users as assessor to avoid sign-in dead-end in first-run environments.
  const shouldBeAdmin = isConfiguredAdminEmail(primaryEmail)
  try {
    return await prisma.user.create({
      data: {
        clerkId: clerkUserId,
        email: primaryEmail,
        name: derivedName,
        role: shouldBeAdmin ? UserRole.ADMIN : UserRole.ASSESSOR,
      },
    })
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const found = await prisma.user.findUnique({ where: { clerkId: clerkUserId } })
      if (found) return found
    }
    throw e
  }
}

