import { getEvaluations } from '../../actions/evaluations'
import { getMyScheduledAssessments } from '../../actions/schedules'
import { formatDateISO } from '../../lib/utils'
import Link from 'next/link'
import Badge from '../../components/ui/Badge'
import StartAssessmentButton from '../../components/StartAssessmentButton'
import { formatWindowText, isWithinScheduleWindow } from '../../lib/schedule-window'

export default async function DashboardPage() {
  const [evaluations, scheduledAssessments] = await Promise.all([getEvaluations(), getMyScheduledAssessments()])

  const total = evaluations.length
  const uniqueStudents = new Set(evaluations.map((e) => e.studentId)).size
  const completedCount = evaluations.filter((e) => e.status === 'completed').length
  const inProgressCount = evaluations.filter((e) => e.status === 'in-progress').length
  const averageSections =
    total === 0
      ? 0
      : evaluations.reduce((sum, e) => sum + e.completedSections.length, 0) / total

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Welcome, Assessor</h2>
          <p className="text-sm text-slate-500">Track performance and review radiograph evaluations from scheduled sessions.</p>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500">Total Evaluations</div>
          <div className="text-3xl font-semibold mt-2">{total}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500">Students Assessed</div>
          <div className="text-3xl font-semibold mt-2">{uniqueStudents}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500">Completed Evaluations</div>
          <div className="text-3xl font-semibold mt-2">{completedCount}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500">In Progress</div>
          <div className="text-3xl font-semibold mt-2">{inProgressCount}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500">Avg. Sections Completed</div>
          <div className="text-3xl font-semibold mt-2">{averageSections.toFixed(1)}</div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">My Scheduled Assessments</h3>
            <p className="text-xs text-slate-500">{formatWindowText()}</p>
          </div>
        </div>

        {scheduledAssessments.length === 0 ? (
          <div className="rounded-xl border bg-white p-6 text-center text-slate-500 shadow-sm">
            No scheduled assessments assigned right now.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <table className="w-full table-auto">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Scheduled Time</th>
                  <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Student</th>
                  <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Primary</th>
                  <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Secondary</th>
                  <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Location</th>
                  <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {scheduledAssessments.map((schedule) => {
                  const canStart = isWithinScheduleWindow(new Date(schedule.scheduledAt))
                  return (
                    <tr key={schedule.id} className="border-t hover:bg-slate-50">
                      <td className="p-3">{formatDateISO(schedule.scheduledAt)}</td>
                      <td className="p-3">{schedule.student.name} ({schedule.student.studentId})</td>
                      <td className="p-3">{schedule.primaryAssessor.name || schedule.primaryAssessor.email}</td>
                      <td className="p-3">{schedule.secondaryAssessor?.name || schedule.secondaryAssessor?.email || '-'}</td>
                      <td className="p-3">{schedule.location || '-'}</td>
                      <td className="p-3">
                        {canStart ? (
                          <StartAssessmentButton scheduleId={schedule.id} canStart={true} />
                        ) : (
                          <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            Outside time range
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        {evaluations.length === 0 ? (
          <div className="p-6 bg-white rounded-xl border shadow-sm text-center">
            <p className="mb-4">No evaluations recorded yet.</p>
            <p className="text-sm text-slate-500">Evaluations can only be started from assigned schedules.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full table-auto">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Date</th>
                  <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Student ID</th>
                  <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Student Name</th>
                  <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Status</th>
                  <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Current Section</th>
                  <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Sections Done</th>
                  <th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="p-3">{formatDateISO(e.createdAt)}</td>
                    <td className="p-3">{e.student?.studentId || '-'}</td>
                    <td className="p-3">{e.student?.name || 'Not Selected'}</td>
                    <td className="p-3">
                      <span className={e.status === 'completed' ? 'inline-flex rounded-full bg-green-50 text-green-700 px-2.5 py-1 font-semibold' : 'inline-flex rounded-full bg-amber-50 text-amber-700 px-2.5 py-1 font-semibold'}>
                        {e.status.replaceAll('-', ' ')}
                      </span>
                    </td>
                    <td className="p-3">{e.currentSection.replaceAll('-', ' ')}</td>
                    <td className="p-3">{e.completedSections.length}</td>
                    <td className="p-3"><Link href={`/evaluations/${e.id}`} className="text-[#175cc5] hover:text-[#114ca5] font-medium">View</Link></td>
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
