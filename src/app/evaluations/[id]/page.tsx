import { prisma } from '../../../lib/prisma'
import EvaluationForm from '../../../components/EvaluationForm'
import SecondaryAssessorAssignment from '../../../components/SecondaryAssessorAssignment'
import { auth } from '@clerk/nextjs/server'
import { getOrCreatePortalUser } from '../../../lib/auth-user'
import { UserRole } from '@prisma/client'

export default async function EvaluationDetailPage({ params }: { params: { id: string } }) {
  const id = params.id
  const { userId } = auth()

  const [evaluation, students, assessors, currentUser] = await Promise.all([
    prisma.evaluation.findUnique({ where: { id }, include: { student: true, assessor: true } }),
    prisma.student.findMany({ orderBy: { name: 'asc' } }),
    prisma.user.findMany({
      where: { role: { in: [UserRole.ASSESSOR, UserRole.ADMIN] } },
      select: { id: true, email: true, name: true, role: true },
      orderBy: { name: 'asc' },
    }),
    userId ? getOrCreatePortalUser(userId) : Promise.resolve(null),
  ])

  if (!evaluation) return <div className="p-6">Evaluation not found.</div>

  const currentUserRole = currentUser?.role ?? null
  const isPrimaryAssessor = currentUser?.id === evaluation.assessorId
  const isSecondaryAssessor = currentUser?.id === evaluation.secondaryAssessorId
  const isAdmin = currentUserRole === UserRole.ADMIN

  if (currentUser && !isAdmin && !isPrimaryAssessor && !isSecondaryAssessor) {
    return <div className="p-6">Unauthorized to view this evaluation.</div>
  }

  const accessMode = isAdmin ? 'admin' : isPrimaryAssessor ? 'primary' : isSecondaryAssessor ? 'secondary' : 'view'

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Evaluation Form</h1>
        <p className="text-sm text-slate-500">
          {evaluation.student 
            ? `Edit and save the evaluation form for ${evaluation.student.name} (${evaluation.student.studentId}).`
            : 'Edit and save the evaluation form. Select a student on the first section.'}
        </p>
      </div>

      {isAdmin ? (
        <div className="mb-6 space-y-4">
          <SecondaryAssessorAssignment
            evaluationId={evaluation.id}
            assessors={assessors.map((assessor) => ({
              id: assessor.id,
              email: assessor.email,
              name: assessor.name,
            }))}
            currentSecondaryAssessorId={evaluation.secondaryAssessorId}
          />
        </div>
      ) : null}

      <EvaluationForm
        students={students}
        currentStudent={evaluation.student}
        evaluationId={evaluation.id}
        defaultValues={(evaluation.preProcedureData as Record<string, any>) || { studentId: evaluation.student?.studentId }}
        accessMode={accessMode}
      />
    </div>
  )
}
