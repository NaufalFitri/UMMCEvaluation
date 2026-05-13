import '../styles/globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import AppShell from '../components/AppShell'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'Radiograph Student Evaluation',
  description: 'Assess radiograph student submissions with clear, structured evaluation flows.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className={inter.className}>
        <ClerkProvider>
          <AppShell>{children}</AppShell>
        </ClerkProvider>
      </body>
    </html>
  )
}
