import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { NextResponse } from 'next/server'
import { getOrCreatePortalUser } from '@/lib/auth-user'

export async function POST(request: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
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
