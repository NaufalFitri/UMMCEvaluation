import '@/styles/globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import AppShell from '@/components/AppShell'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'Radiograph Student Evaluation',
  description: 'Assess radiograph student submissions with clear, structured evaluation flows.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

  return (
    <html lang="en">
      <head />
      <body className={inter.className}>
        {hasClerkKey ? (
          <ClerkProvider>
            <AppShell>{children}</AppShell>
          </ClerkProvider>
        ) : (
          <AppShell>{children}</AppShell>
        )}
      </body>
    </html>
  )
}
