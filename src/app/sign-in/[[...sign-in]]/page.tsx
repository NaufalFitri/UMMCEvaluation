import { SignIn } from '@clerk/nextjs'
import AuthFrame from '../../../components/AuthFrame'

export default function SignInPage({ searchParams }: { searchParams?: { error?: string } }) {
  const hasNoAccountError = searchParams?.error === 'no_account'

  return (
    <AuthFrame title="Welcome Back" subtitle="Sign in to continue your clinical assessment workflow.">
      {hasNoAccountError ? (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Account profile was not found before. Please sign in again, your account will be provisioned automatically.
        </div>
      ) : null}
      <SignIn
        path="/sign-in"
        routing="path"
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'shadow-none border border-slate-200 rounded-xl',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            socialButtonsBlockButton: 'border-slate-300 hover:bg-slate-50',
            formButtonPrimary: 'bg-[#175cc5] hover:bg-[#114ca5] text-sm',
            formFieldInput: 'border-slate-300 focus:border-blue-400 focus:ring-blue-200',
            footerActionLink: 'text-[#175cc5] hover:text-[#114ca5]',
          },
        }}
      />
    </AuthFrame>
  )
}
