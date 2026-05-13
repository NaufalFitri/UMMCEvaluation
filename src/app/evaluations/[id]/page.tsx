import { prisma } from '../../../lib/prisma'
import { formatDateISO } from '../../../lib/utils'

export default async function EvaluationDetailPage({ params }: { params: { id: string } }) {
  const id = params.id
  const evaluation = await prisma.evaluation.findUnique({ where: { id }, include: { student: true, assessor: true } })

  if (!evaluation) return <div>Evaluation not found.</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold">Evaluation Detail</h1>
      <p>Date: {formatDateISO(evaluation.createdAt)}</p>
      <p>Student: {evaluation.student.name} ({evaluation.student.studentId})</p>
      <p>Assessor: {evaluation.assessor.name}</p>
      <p>Status: {evaluation.status}</p>
      <p>Current Section: {evaluation.currentSection}</p>
      <p>Sections Completed: {evaluation.completedSections.length}</p>
      <p className="mt-4">Pre-Procedure Data:</p>
      <pre className="whitespace-pre-wrap text-sm bg-slate-50 p-4 rounded-md">
        {JSON.stringify(evaluation.preProcedureData, null, 2)}
      </pre>
    </div>
  )
}
