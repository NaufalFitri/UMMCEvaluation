'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '../lib/prisma'
import { evaluationSchema, type EvaluationInput } from '../lib/validations'
import { revalidatePath } from 'next/cache'

export async function createEvaluation(formData: EvaluationInput) {
  const { userId } = auth()
  if (!userId) throw new Error('UNAUTHENTICATED')

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'ASSESSOR') throw new Error('UNAUTHORIZED')

  const validationResult = evaluationSchema.safeParse(formData)
  if (!validationResult.success) {
    return { success: false, errors: validationResult.error.flatten() }
  }

  const { positioningScore, studentId } = validationResult.data
  if (positioningScore < 1 || positioningScore > 10) {
    return { success: false, errors: { positioningScore: ['Score must be between 1 and 10'] } }
  }

  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (!student) {
    return { success: false, errors: { studentId: ['Student not found'] } }
  }

  const newEvaluation = await prisma.evaluation.create({
    data: {
      studentId: student.id,
      assessorId: user.id,
      positioningScore: validationResult.data.positioningScore,
      exposureRating: validationResult.data.exposureRating,
      clinicalFeedback: validationResult.data.clinicalFeedback,
    },
  })

  try {
    revalidatePath('/dashboard')
  } catch (e) {
    // best effort
  }

  return { success: true, id: newEvaluation.id }
}

export async function getEvaluations() {
  const { userId } = auth()
  if (!userId) throw new Error('UNAUTHENTICATED')

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'ASSESSOR') throw new Error('UNAUTHORIZED')

  const evaluations = await prisma.evaluation.findMany({
    include: { student: true, assessor: true },
    orderBy: { createdAt: 'desc' },
  })

  return evaluations
}
