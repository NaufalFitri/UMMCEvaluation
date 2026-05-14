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

// GET - List all assessors
export async function GET() {
  try {
    const { userId } = auth()
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const assessors = await prisma.user.findMany({
      where: { role: { in: [UserRole.ASSESSOR, UserRole.ADMIN] } },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(assessors)
  } catch (error) {
    console.error('Error fetching assessors:', error)
    return NextResponse.json({ error: 'Failed to fetch assessors' }, { status: 500 })
  }
}

// POST - Create new assessor (requires Clerk ID or creates manual entry)
export async function POST(request: Request) {
  try {
    const { userId } = auth()
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { email, name, role } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if assessor already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Create new assessor without Clerk ID (will be linked when they first sign in)
    const assessor = await prisma.user.create({
      data: {
        email,
        name: name || email,
        role: role === 'ADMIN' ? UserRole.ADMIN : UserRole.ASSESSOR,
        clerkId: `pending_${Date.now()}`, // Temporary placeholder
      },
    })

    return NextResponse.json({
      id: assessor.id,
      email: assessor.email,
      name: assessor.name,
      role: assessor.role,
      createdAt: assessor.createdAt,
    })
  } catch (error: any) {
    console.error('Error creating assessor:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create assessor' }, { status: 500 })
  }
}
