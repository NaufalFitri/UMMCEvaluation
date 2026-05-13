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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <Link href="/evaluations/new" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded">New Evaluation</Link>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Total Evaluations</div>
          <div className="text-2xl font-bold">{total}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Students Assessed</div>
          <div className="text-2xl font-bold">{uniqueStudents}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Average Positioning Score</div>
          <div className="text-2xl font-bold">{avgScore.toFixed(1)}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Optimal Exposures</div>
          <div className="text-2xl font-bold">{optimalCount}</div>
        </div>
      </section>

      <section>
        {evaluations.length === 0 ? (
          <div className="p-6 bg-white rounded shadow text-center">
            <p className="mb-4">No evaluations recorded yet.</p>
            <Link href="/evaluations/new" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded">Submit First Evaluation →</Link>
          </div>
        ) : (
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Student ID</th>
                  <th className="p-3 text-left">Student Name</th>
                  <th className="p-3 text-left">Positioning Score</th>
                  <th className="p-3 text-left">Exposure Rating</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="p-3">{formatDateISO(e.createdAt)}</td>
                    <td className="p-3">{e.student.studentId}</td>
                    <td className="p-3">{e.student.name}</td>
                    <td className="p-3">
                      <span className={
                        e.positioningScore <= 4 ? 'text-red-600 font-bold' : e.positioningScore <= 7 ? 'text-amber-600 font-bold' : 'text-green-600 font-bold'
                      }>
                        {e.positioningScore}
                      </span>
                    </td>
                    <td className="p-3"><Badge rating={e.exposureRating} /></td>
                    <td className="p-3"><Link href={`/evaluations/${e.id}`} className="text-blue-600 underline">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
