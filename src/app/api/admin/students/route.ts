import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { NextResponse } from 'next/server'
import { getOrCreatePortalUser } from '@/lib/auth-user'

// Check if user is admin
async function isAdmin(clerkId: string) {
  const user = await getOrCreatePortalUser(clerkId)
  return user?.role === UserRole.ADMIN
}

// GET - List all students
export async function GET() {
  try {
    const { userId } = auth()
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const students = await prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}

// POST - Create new student
export async function POST(request: Request) {
  try {
    const { userId } = auth()
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { studentId, name, email } = await request.json()

    if (!studentId || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if student ID already exists
    const existing = await prisma.student.findUnique({
      where: { studentId },
    })

    if (existing) {
      return NextResponse.json({ error: 'Student ID already exists' }, { status: 400 })
    }

    const student = await prisma.student.create({
      data: { studentId, name, email },
    })

    return NextResponse.json(student)
  } catch (error: any) {
    console.error('Error creating student:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 })
  }
}
