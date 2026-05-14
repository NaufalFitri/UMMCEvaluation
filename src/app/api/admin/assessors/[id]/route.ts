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

// PUT - Update assessor
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth()
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { name, role } = await request.json()

    const assessor = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: name || undefined,
        role: role === 'ADMIN' ? UserRole.ADMIN : UserRole.ASSESSOR,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })

    return NextResponse.json(assessor)
  } catch (error: any) {
    console.error('Error updating assessor:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Assessor not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update assessor' }, { status: 500 })
  }
}

// DELETE - Delete assessor
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth()
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting assessor:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Assessor not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete assessor' }, { status: 500 })
  }
}
