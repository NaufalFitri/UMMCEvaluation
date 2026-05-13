import { SignIn } from '@clerk/nextjs'
import AuthFrame from '../../../components/AuthFrame'

export default function SignInPage() {
  return (
    <AuthFrame title="Welcome Back" subtitle="Sign in to continue your clinical assessment workflow.">
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
