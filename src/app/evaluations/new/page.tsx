import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '../../../lib/prisma'
import EvaluationForm from '../../../components/EvaluationForm'

export default async function NewEvaluationPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const students = await prisma.student.findMany({ orderBy: { name: 'asc' } })

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">New Evaluation</h1>
      <EvaluationForm students={students} />
    </div>
  )
}
