import { SignIn } from '@clerk/nextjs'
import AuthFrame from '../../../components/AuthFrame'

export default function SignInPage({ searchParams }: { searchParams?: { error?: string } }) {
  const hasNoAccountError = searchParams?.error === 'no_account'
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

  return (
    <AuthFrame title="Welcome Back" subtitle="Sign in to continue your clinical assessment workflow.">
      {hasNoAccountError ? (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Account profile was not found before. Please sign in again, your account will be provisioned automatically.
        </div>
      ) : null}
      {hasClerkKey ? (
        <SignIn
          path="/sign-in"
          routing="path"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-none border border-slate-200 rounded-2xl bg-white/95 backdrop-blur',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 'border-slate-300 hover:bg-slate-50',
              formButtonPrimary: 'bg-[#175cc5] hover:bg-[#114ca5] text-sm',
              formFieldInput: 'border-slate-300 focus:border-blue-400 focus:ring-blue-200',
              footerActionLink: 'text-[#175cc5] hover:text-[#114ca5]',
            },
          }}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="rounded-xl bg-[#eff5ff] border border-[#cfe0ff] p-4 text-sm text-[#0b3a66]">
            Clerk keys are not set in this local environment, so the interactive sign-in form is hidden.
            Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to .env.local to enable the live Clerk UI.
          </div>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                disabled
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-400"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                disabled
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-400"
              />
            </div>
            <button className="w-full rounded-xl bg-[#175cc5] px-4 py-3 font-medium text-white opacity-70" disabled>
              Sign In
            </button>
          </div>
        </div>
      )}
    </AuthFrame>
  )
}
