import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getOrCreatePortalUser } from '@/lib/auth-user'

export async function POST(request: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create user
    const user = await getOrCreatePortalUser(userId)

    const { studentId } = await request.json()

    if (!studentId) {
      return Response.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Create new evaluation
    const evaluation = await prisma.evaluation.create({
      data: {
        studentId,
        assessorId: user.id,
        currentSection: 'pre-procedure-checklist',
        status: 'in-progress',
        completedSections: [],
      },
    })

    return Response.json({ id: evaluation.id })
  } catch (error) {
    console.error('Error creating evaluation:', error)
    return Response.json(
      { error: 'Failed to create evaluation' },
      { status: 500 }
    )
  }
}
