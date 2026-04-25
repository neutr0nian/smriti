import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ConversationMeta } from '@/types/conversation'
import { listConversations, createConversation, deleteConversation, renameConversation } from '@/api/conversations'

interface SidebarContextValue {
  conversationList: ConversationMeta[]
  activeConversationId: string
  setActiveConversationId: (id: string) => void
  collapsed: boolean
  toggleSidebar: () => void
  addConversation: () => Promise<void>
  removeConversation: (id: string) => Promise<void>
  updateConversationTitle: (id: string, title: string) => Promise<void>
  generateConversationTitle: (id: string) => Promise<void>
  loading: boolean
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [conversationList, setConversationList] = useState<ConversationMeta[]>([])
  const [activeConversationId, setActiveConversationId] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    listConversations().then(list => {
      if (cancelled) return
      setConversationList(list)
      if (list.length > 0) setActiveConversationId(list[0].id)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const addConversation = useCallback(async () => {
    const conv = await createConversation()
    setConversationList(list => [conv, ...list])
    setActiveConversationId(conv.id)
  }, [])

  const removeConversation = useCallback(async (id: string) => {
    await deleteConversation(id)
    setConversationList(list => {
      const next = list.filter(c => c.id !== id)
      if (id === activeConversationId) {
        setActiveConversationId(next[0]?.id ?? '')
      }
      return next
    })
  }, [activeConversationId])

  const updateConversationTitle = useCallback(async (id: string, title: string) => {
    await renameConversation(id, title)
    setConversationList(list => list.map(c => c.id === id ? { ...c, title } : c))
  }, [])

  const generateConversationTitle = useCallback(async (_id: string) => {
    console.warn('generateConversationTitle: not implemented yet')
  }, [])

  return (
    <SidebarContext.Provider value={{
      conversationList,
      activeConversationId,
      setActiveConversationId,
      collapsed,
      toggleSidebar: () => setCollapsed(c => !c),
      addConversation,
      removeConversation,
      updateConversationTitle,
      generateConversationTitle,
      loading,
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
