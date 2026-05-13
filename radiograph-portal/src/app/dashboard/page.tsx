import { getEvaluations } from '../../actions/evaluations'
import { formatDateISO } from '../../lib/utils'
import Link from 'next/link'
import Badge from '../../components/ui/Badge'

export default async function DashboardPage() {
  const evaluations = await getEvaluations()

  const total = evaluations.length
  const uniqueStudents = new Set(evaluations.map((e) => e.studentId)).size
  const avgScore =
    total === 0 ? 0 : evaluations.reduce((s, e) => s + e.positioningScore, 0) / total
  const optimalCount = evaluations.filter((e) => e.exposureRating === 'OPTIMAL').length

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <Link href="/evaluations/new" className="btn btn-primary">New Evaluation</Link>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-white rounded shadow">Total Evaluations: {total}</div>
        <div className="p-4 bg-white rounded shadow">Students Assessed: {uniqueStudents}</div>
        <div className="p-4 bg-white rounded shadow">Average Positioning Score: {avgScore.toFixed(1)}</div>
        <div className="p-4 bg-white rounded shadow">Optimal Exposures: {optimalCount}</div>
      </section>

      <section>
        {evaluations.length === 0 ? (
          <div>
            <p>No evaluations recorded yet.</p>
            <Link href="/evaluations/new" className="text-blue-600 underline">Submit First Evaluation →</Link>
          </div>
        ) : (
          <table className="w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Student ID</th>
                <th className="p-2 text-left">Student Name</th>
                <th className="p-2 text-left">Positioning Score</th>
                <th className="p-2 text-left">Exposure Rating</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-2">{formatDateISO(e.createdAt)}</td>
                  <td className="p-2">{e.student.studentId}</td>
                  <td className="p-2">{e.student.name}</td>
                  <td className="p-2">
                    <span className={
                      e.positioningScore <= 4 ? 'text-red-600' : e.positioningScore <= 7 ? 'text-amber-600' : 'text-green-600'
                    }>
                      {e.positioningScore}
                    </span>
                  </td>
                  <td className="p-2">
                    <Badge rating={e.exposureRating} />
                  </td>
                  <td className="p-2">
                    <Link href={`/evaluations/${e.id}`} className="text-blue-600 underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
