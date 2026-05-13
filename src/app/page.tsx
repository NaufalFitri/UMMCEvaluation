import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f2f6fd]">
      <section className="relative overflow-hidden bg-gradient-to-b from-[#08325b] via-[#0a3c70] to-[#042645] text-white">
        <div className="absolute -top-24 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-16 right-0 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-blue-200 uppercase tracking-[0.2em] text-xs">Clinical Evaluation Platform</p>
            <h1 className="mt-4 text-4xl lg:text-6xl font-semibold leading-tight">
              Radiograph Student Evaluation Web Portal
            </h1>
            <p className="mt-6 text-lg text-blue-100 max-w-2xl">
              A structured assessment system for objective radiograph critique, scoring, and feedback documentation.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/sign-in" className="inline-flex items-center px-5 py-3 rounded-md bg-white text-[#08325b] font-medium hover:bg-blue-50 transition">
                Sign In
              </Link>
              <Link href="/sign-up" className="inline-flex items-center px-5 py-3 rounded-md border border-blue-300/40 text-white hover:bg-white/10 transition">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-4 -mt-10 relative z-10">
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <div className="text-sm text-slate-500">Workflow</div>
          <div className="mt-2 text-xl font-semibold text-slate-900">12-step guided assessment</div>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <div className="text-sm text-slate-500">Scoring</div>
          <div className="mt-2 text-xl font-semibold text-slate-900">Standardized rubric and exposure rating</div>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <div className="text-sm text-slate-500">Reporting</div>
          <div className="mt-2 text-xl font-semibold text-slate-900">Structured feedback and summary history</div>
        </div>
      </section>
    </main>
  )
}
