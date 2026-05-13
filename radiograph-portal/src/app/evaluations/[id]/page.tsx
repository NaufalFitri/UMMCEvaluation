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
      <p>Positioning Score: {evaluation.positioningScore}</p>
      <p>Exposure Rating: {evaluation.exposureRating}</p>
      <p className="mt-4">Feedback:</p>
      <p className="whitespace-pre-wrap">{evaluation.clinicalFeedback}</p>
    </div>
  )
}
