import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminDashboard() {
  const totalStudents = await prisma.student.count()
  const totalAssessors = await prisma.user.count({
    where: { role: { in: ['ASSESSOR', 'ADMIN'] } },
  })
  const totalEvaluations = await prisma.evaluation.count()
  const completedEvaluations = await prisma.evaluation.count({
    where: { status: 'completed' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h2>
          <p className="text-sm text-slate-500">Manage system users and evaluations</p>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500">Total Students</div>
          <div className="text-3xl font-semibold mt-2">{totalStudents}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500">Total Assessors</div>
          <div className="text-3xl font-semibold mt-2">{totalAssessors}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500">Total Evaluations</div>
          <div className="text-3xl font-semibold mt-2">{totalEvaluations}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500">Completed</div>
          <div className="text-3xl font-semibold mt-2">{completedEvaluations}</div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Student Management</h3>
            <Link href="/admin/students" className="text-[#175cc5] hover:text-[#114ca5] text-sm font-medium">View All →</Link>
          </div>
          <p className="text-sm text-slate-500 mb-4">Add, edit, and manage student records</p>
          <Link href="/admin/students" className="inline-flex items-center px-4 py-2 bg-[#175cc5] hover:bg-[#114ca5] text-white rounded-md transition">Manage Students</Link>
        </div>

        <div className="p-6 bg-white rounded-xl border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Assessor Management</h3>
            <Link href="/admin/assessors" className="text-[#175cc5] hover:text-[#114ca5] text-sm font-medium">View All →</Link>
          </div>
          <p className="text-sm text-slate-500 mb-4">Add, edit, and manage assessor accounts</p>
          <Link href="/admin/assessors" className="inline-flex items-center px-4 py-2 bg-[#175cc5] hover:bg-[#114ca5] text-white rounded-md transition">Manage Assessors</Link>
        </div>
      </section>
    </div>
  )
}
