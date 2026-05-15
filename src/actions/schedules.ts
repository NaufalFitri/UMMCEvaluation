'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { getOrCreatePortalUser } from '@/lib/auth-user'

export async function getMyScheduledAssessments() {
  const { userId } = auth()
  if (!userId) throw new Error('UNAUTHENTICATED')

  const user = await getOrCreatePortalUser(userId)
  const canAssess = user && (user.role === UserRole.ASSESSOR || user.role === UserRole.ADMIN)
  if (!canAssess) throw new Error('UNAUTHORIZED')

  const whereClause = user.role === UserRole.ADMIN
    ? { status: 'SCHEDULED' as const }
    : {
        status: 'SCHEDULED' as const,
        OR: [
          { primaryAssessorId: user.id },
          { secondaryAssessorId: user.id },
        ],
      }

  return prisma.assessmentSchedule.findMany({
    where: whereClause,
    include: {
      student: { select: { id: true, studentId: true, name: true } },
      primaryAssessor: { select: { id: true, name: true, email: true } },
      secondaryAssessor: { select: { id: true, name: true, email: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  })
}
