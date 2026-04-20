import { createContext, useContext, useState } from 'react'
import type { ConversationMeta } from '@/types/conversation'
import { MOCK_CONVERSATION_LIST } from '@/mocks/conversations'

interface SidebarContextValue {
  conversationList: ConversationMeta[]
  activeConversationId: string
  setActiveConversationId: (id: string) => void
  collapsed: boolean
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [activeConversationId, setActiveConversationId] = useState(MOCK_CONVERSATION_LIST[0].id)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <SidebarContext.Provider value={{
      conversationList: MOCK_CONVERSATION_LIST,
      activeConversationId,
      setActiveConversationId,
      collapsed,
      toggleSidebar: () => setCollapsed(c => !c),
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}
