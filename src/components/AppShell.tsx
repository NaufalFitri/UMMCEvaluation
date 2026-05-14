import React from 'react'
import Sidebar from './Sidebar'
import AppShellClient from './AppShellClient'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShellClient sidebar={<Sidebar />}>
      {children}
    </AppShellClient>
  )
}
