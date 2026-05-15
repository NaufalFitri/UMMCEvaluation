import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { clerkClient } from '@clerk/nextjs/server'
import * as XLSX from 'xlsx'
import { getOrCreatePortalUser } from '@/lib/auth-user'

type UploadTarget = 'all' | 'assessors' | 'students' | 'schedules'

function resolveSheet(workbook: XLSX.WorkBook, preferredName: string) {
  if (workbook.SheetNames.includes(preferredName)) {
    return workbook.Sheets[preferredName]
  }
  if (workbook.SheetNames.length === 1) {
    return workbook.Sheets[workbook.SheetNames[0]]
  }
  return null
}

export async function POST(request: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getOrCreatePortalUser(userId)
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const targetRaw = String(formData.get('target') || 'all').toLowerCase()
    const target: UploadTarget = ['assessors', 'students', 'schedules'].includes(targetRaw)
      ? (targetRaw as UploadTarget)
      : 'all'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' })

    const results = {
      assessors: { created: 0, failed: 0, errors: [] as string[] },
      students: { created: 0, failed: 0, errors: [] as string[] },
      schedules: { created: 0, failed: 0, errors: [] as string[] },
    }

    // Process Assessors sheet
    if (target === 'all' || target === 'assessors') {
      const assessorsSheet = resolveSheet(workbook, 'Assessors')
      if (!assessorsSheet) {
        results.assessors.failed++
        results.assessors.errors.push('Assessors sheet not found')
      } else {
      const assessorsData = XLSX.utils.sheet_to_json(assessorsSheet)

      for (const row of assessorsData) {
        try {
          const email = (row as any)['email']?.trim()
          const name = (row as any)['name']?.trim() || email

          if (!email) {
            results.assessors.failed++
            results.assessors.errors.push('Row missing email')
            continue
          }

          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email },
          })

          if (existingUser) {
            results.assessors.errors.push(`${email} already exists`)
            results.assessors.failed++
            continue
          }

          // Create Clerk user
          const clerkUser = await clerkClient().users.createUser({
            emailAddress: [email],
            firstName: name.split(' ')[0],
            lastName: name.split(' ').slice(1).join(' '),
            password: 'TempPassword123!',
          })

          // Create portal user
          await prisma.user.create({
            data: {
              clerkId: clerkUser.id,
              email,
              name,
              role: UserRole.ASSESSOR,
            },
          })

          results.assessors.created++
        } catch (err: any) {
          results.assessors.failed++
          results.assessors.errors.push(err.message || 'Unknown error')
        }
      }
    }
    }

    // Process Students sheet
    if (target === 'all' || target === 'students') {
      const studentsSheet = resolveSheet(workbook, 'Students')
      if (!studentsSheet) {
        results.students.failed++
        results.students.errors.push('Students sheet not found')
      } else {
      const studentsData = XLSX.utils.sheet_to_json(studentsSheet)

      for (const row of studentsData) {
        try {
          const studentId = (row as any)['studentId']?.trim()
          const name = (row as any)['name']?.trim()
          const email = (row as any)['email']?.trim()

          if (!studentId || !name || !email) {
            results.students.failed++
            results.students.errors.push('Row missing required fields (studentId, name, email)')
            continue
          }

          // Check if student already exists
          const existingStudent = await prisma.student.findUnique({
            where: { studentId },
          })

          if (existingStudent) {
            results.students.errors.push(`Student ${studentId} already exists`)
            results.students.failed++
            continue
          }

          await prisma.student.create({
            data: {
              studentId,
              name,
              email,
            },
          })

          results.students.created++
        } catch (err: any) {
          results.students.failed++
          results.students.errors.push(err.message || 'Unknown error')
        }
      }
    }
    }

    // Process Schedules sheet
    if (target === 'all' || target === 'schedules') {
      const schedulesSheet = resolveSheet(workbook, 'Schedules')
      if (!schedulesSheet) {
        results.schedules.failed++
        results.schedules.errors.push('Schedules sheet not found')
      } else {
      const schedulesData = XLSX.utils.sheet_to_json(schedulesSheet)

      for (const row of schedulesData) {
        try {
          const studentId = (row as any)['studentId']?.trim()
          const primaryAssessorEmail = (row as any)['primaryAssessorEmail']?.trim()
          const secondaryAssessorEmail = (row as any)['secondaryAssessorEmail']?.trim()
          const scheduledAtStr = (row as any)['scheduledAt']
          const location = (row as any)['location']?.trim()
          const notes = (row as any)['notes']?.trim()

          if (!studentId || !primaryAssessorEmail || !scheduledAtStr) {
            results.schedules.failed++
            results.schedules.errors.push('Row missing required fields (studentId, primaryAssessorEmail, scheduledAt)')
            continue
          }

          // Verify student exists
          const student = await prisma.student.findUnique({
            where: { studentId },
          })
          if (!student) {
            results.schedules.failed++
            results.schedules.errors.push(`Student ${studentId} not found`)
            continue
          }

          // Lookup assessors by email
          const primaryAssessor = await prisma.user.findUnique({
            where: { email: primaryAssessorEmail },
          })
          if (!primaryAssessor) {
            results.schedules.failed++
            results.schedules.errors.push(`Primary assessor ${primaryAssessorEmail} not found`)
            continue
          }

          let secondaryAssessorId: string | null = null
          if (secondaryAssessorEmail) {
            const secondaryAssessor = await prisma.user.findUnique({
              where: { email: secondaryAssessorEmail },
            })
            if (secondaryAssessor) {
              secondaryAssessorId = secondaryAssessor.id
            }
          }

          // Parse date - handle both Excel date numbers and ISO strings
          let scheduledAt: Date
          if (typeof scheduledAtStr === 'number') {
            // Excel date (days since 1900-01-01)
            scheduledAt = new Date((scheduledAtStr - 25569) * 86400 * 1000)
          } else {
            scheduledAt = new Date(scheduledAtStr)
          }

          if (isNaN(scheduledAt.getTime())) {
            results.schedules.failed++
            results.schedules.errors.push('Invalid date format')
            continue
          }

          await prisma.assessmentSchedule.create({
            data: {
              studentId: student.id,
              primaryAssessorId: primaryAssessor.id,
              secondaryAssessorId,
              scheduledAt,
              location,
              notes,
              status: 'SCHEDULED',
            },
          })

          results.schedules.created++
        } catch (err: any) {
          results.schedules.failed++
          results.schedules.errors.push(err.message || 'Unknown error')
        }
      }
    }
    }

    return NextResponse.json({
      success: true,
      target,
      results,
      message: 'Excel import completed',
    })
  } catch (error: any) {
    console.error('Error processing Excel file:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process Excel file' },
      { status: 500 }
    )
  }
}
