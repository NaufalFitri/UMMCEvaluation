import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { NextResponse } from 'next/server'
import { getOrCreatePortalUser } from '@/lib/auth-user'
import { isWithinScheduleWindow } from '@/lib/schedule-window'

export async function POST(request: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await getOrCreatePortalUser(userId)
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { scheduleId } = body

    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 })
    }

    // Get schedule details
    const schedule = await prisma.assessmentSchedule.findUnique({
      where: { id: scheduleId },
      include: { student: true, primaryAssessor: true, secondaryAssessor: true },
    })

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    const isAssignedAssessor =
      schedule.primaryAssessorId === currentUser.id || schedule.secondaryAssessorId === currentUser.id
    const isAdmin = currentUser.role === UserRole.ADMIN

    if (!isAssignedAssessor && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - schedule is not assigned to you' }, { status: 403 })
    }

    if (schedule.status !== 'SCHEDULED') {
      return NextResponse.json({ error: 'This schedule is not available to start' }, { status: 400 })
    }

    if (!isWithinScheduleWindow(new Date(schedule.scheduledAt))) {
      return NextResponse.json(
        { error: 'Assessment can only be started within the allowed time window' },
        { status: 400 }
      )
    }

    // Reuse latest in-progress evaluation for this schedule's assignee/student pairing.
    const existing = await prisma.evaluation.findFirst({
      where: {
        studentId: schedule.studentId,
        assessorId: schedule.primaryAssessorId,
        secondaryAssessorId: schedule.secondaryAssessorId ?? null,
        status: 'in-progress',
      },
      orderBy: { createdAt: 'desc' },
    })

    if (existing) {
      return NextResponse.json({
        success: true,
        id: existing.id,
        message: 'Existing in-progress evaluation opened',
      })
    }

    // Create evaluation with schedule info
    const evaluation = await prisma.evaluation.create({
      data: {
        studentId: schedule.studentId,
        assessorId: schedule.primaryAssessorId,
        secondaryAssessorId: schedule.secondaryAssessorId || undefined,
        maklumatPesakitData: JSON.stringify({
          namaPelatih: schedule.student?.name || '',
          nomborPendaftaran: '',
          kawasanPemeriksaan: '',
          indikasiKlinikal: '',
          umur: '',
          jantina: '',
          patientType: {},
        }),
      },
    })

    return NextResponse.json({
      success: true,
      id: evaluation.id,
      message: 'Evaluation created from schedule',
    })
  } catch (error) {
    console.error('Error creating evaluation from schedule:', error)
    return NextResponse.json(
      { error: 'Failed to create evaluation from schedule' },
      { status: 500 }
    )
  }
}
