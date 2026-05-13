import { prisma } from '../../../lib/prisma'
import EvaluationForm from '../../../components/EvaluationForm'

export default async function EvaluationDetailPage({ params }: { params: { id: string } }) {
  const id = params.id

  const [evaluation, students] = await Promise.all([
    prisma.evaluation.findUnique({ where: { id }, include: { student: true, assessor: true } }),
    prisma.student.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!evaluation) return <div className="p-6">Evaluation not found.</div>

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Latest Evaluation</h1>
        <p className="text-sm text-slate-500">
          Edit and save the latest evaluation form for {evaluation.student.name} ({evaluation.student.studentId}).
        </p>
      </div>

      <EvaluationForm
        students={students}
        evaluationId={evaluation.id}
        defaultValues={(evaluation.preProcedureData as Record<string, any>) || { studentId: evaluation.student.studentId }}
      />
    </div>
  )
}
