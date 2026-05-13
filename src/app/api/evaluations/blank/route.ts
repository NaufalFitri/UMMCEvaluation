import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getOrCreatePortalUser } from '@/lib/auth-user'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Ensure user exists in database
    const user = await getOrCreatePortalUser(userId)

    // Create a blank evaluation without requiring studentId
    const evaluation = await prisma.evaluation.create({
      data: {
        assessorId: user.id,
        status: 'in-progress',
        currentSection: 'pre-procedure-checklist',
      },
    })

    return NextResponse.json({ id: evaluation.id })
  } catch (error) {
    console.error('Error creating evaluation:', error)
    return NextResponse.json({ error: 'Failed to create evaluation' }, { status: 500 })
  }
}
