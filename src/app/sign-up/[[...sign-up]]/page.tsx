import { SignUp } from '@clerk/nextjs'
import AuthFrame from '../../../components/AuthFrame'

export default function SignUpPage() {
  return (
    <AuthFrame title="Create Account" subtitle="Set up your assessor account to begin evaluations.">
      <SignUp
        path="/sign-up"
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
