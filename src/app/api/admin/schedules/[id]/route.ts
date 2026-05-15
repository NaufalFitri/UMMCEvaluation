import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UserRole, ScheduleStatus } from '@prisma/client'
import { NextResponse } from 'next/server'
import { getOrCreatePortalUser } from '@/lib/auth-user'

async function isAdmin(clerkId: string) {
  const user = await getOrCreatePortalUser(clerkId)
  return user?.role === UserRole.ADMIN
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth()
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const {
      studentId,
      primaryAssessorId,
      secondaryAssessorId,
      scheduledAt,
      location,
      notes,
      status,
    } = await request.json()

    const updated = await prisma.assessmentSchedule.update({
      where: { id: params.id },
      data: {
        studentId: studentId || undefined,
        primaryAssessorId: primaryAssessorId || undefined,
        secondaryAssessorId: secondaryAssessorId === '' ? null : secondaryAssessorId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        location: location === '' ? null : location,
        notes: notes === '' ? null : notes,
        status: status && Object.values(ScheduleStatus).includes(status) ? status : undefined,
      },
      include: {
        student: { select: { id: true, studentId: true, name: true } },
        primaryAssessor: { select: { id: true, name: true, email: true } },
        secondaryAssessor: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating schedule:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth()
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized - only admin can delete schedules' }, { status: 403 })
    }

    await prisma.assessmentSchedule.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting schedule:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 })
  }
}
