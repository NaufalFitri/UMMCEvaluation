import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold">Radiograph Student Evaluation</h1>
      <p className="mt-4">Welcome — please sign in to continue.</p>
      <div className="mt-6 space-x-3">
        <Link className="text-blue-600 underline" href="/sign-in">Sign in</Link>
        <Link className="text-blue-600 underline" href="/sign-up">Sign up</Link>
      </div>
    </main>
  )
}
