import { SidebarProvider, useSidebar } from '@/context/SidebarContext'
import Sidebar from './Sidebar'
import './app-shell.css'

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppShellInner>{children}</AppShellInner>
    </SidebarProvider>
  )
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <div className={`app-shell${collapsed ? ' app-shell--collapsed' : ''}`}>
      <Sidebar />
      <div className="app-shell__content">
        {children}
      </div>
    </div>
  )
}
