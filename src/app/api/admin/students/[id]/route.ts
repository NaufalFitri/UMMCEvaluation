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

// PUT - Update student
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth()
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { studentId, name, email } = await request.json()

    const student = await prisma.student.update({
      where: { id: params.id },
      data: { studentId, name, email },
    })

    return NextResponse.json(student)
  } catch (error: any) {
    console.error('Error updating student:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email or Student ID already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 })
  }
}

// DELETE - Delete student
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth()
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.student.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting student:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 })
  }
}
