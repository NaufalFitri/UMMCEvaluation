import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UserRole, ScheduleStatus } from '@prisma/client'
import { NextResponse } from 'next/server'
import { getOrCreatePortalUser } from '@/lib/auth-user'

async function isAdmin(clerkId: string) {
  const user = await getOrCreatePortalUser(clerkId)
  return user?.role === UserRole.ADMIN
}

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const schedules = await prisma.assessmentSchedule.findMany({
      include: {
        student: { select: { id: true, studentId: true, name: true } },
        primaryAssessor: { select: { id: true, name: true, email: true } },
        secondaryAssessor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    })

    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    if (!studentId || !primaryAssessorId || !scheduledAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const schedule = await prisma.assessmentSchedule.create({
      data: {
        studentId,
        primaryAssessorId,
        secondaryAssessorId: secondaryAssessorId || null,
        scheduledAt: new Date(scheduledAt),
        location: location || null,
        notes: notes || null,
        status: status && Object.values(ScheduleStatus).includes(status) ? status : ScheduleStatus.SCHEDULED,
      },
      include: {
        student: { select: { id: true, studentId: true, name: true } },
        primaryAssessor: { select: { id: true, name: true, email: true } },
        secondaryAssessor: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(schedule)
  } catch (error: any) {
    console.error('Error creating schedule:', error)
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 })
  }
}
