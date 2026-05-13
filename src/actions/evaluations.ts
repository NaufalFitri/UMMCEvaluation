'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '../lib/prisma'
import { evaluationSchema, type EvaluationInput } from '../lib/validations'
import { revalidatePath } from 'next/cache'
import { getOrCreatePortalUser } from '../lib/auth-user'

export async function createEvaluation(formData: EvaluationInput) {
  const { userId } = auth()
  if (!userId) throw new Error('UNAUTHENTICATED')

  const user = await getOrCreatePortalUser(userId)
  if (!user || user.role !== 'ASSESSOR') throw new Error('UNAUTHORIZED')

  const validationResult = evaluationSchema.safeParse(formData)
  if (!validationResult.success) {
    return { success: false, errors: validationResult.error.flatten() }
  }

  const parsedData: EvaluationInput = validationResult.data
  const { studentId } = parsedData

  const student = await prisma.student.findUnique({
    where: { studentId: studentId as string },
  })
  if (!student) {
    return { success: false, errors: { studentId: ['Student not found'] } }
  }

  const newEvaluation = await prisma.evaluation.create({
    data: {
      studentId: student.id,
      assessorId: user.id,
      preProcedureData: parsedData as any,
      currentSection: 'pre-procedure-checklist',
      status: 'in-progress',
      completedSections: [],
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

  const user = await getOrCreatePortalUser(userId)
  if (!user || user.role !== 'ASSESSOR') throw new Error('UNAUTHORIZED')

  const evaluations = await prisma.evaluation.findMany({
    include: { student: true, assessor: true },
    orderBy: { createdAt: 'desc' },
  })

  return evaluations
}
