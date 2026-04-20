import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { MessageData, InlineNote, ConversationData } from '@/types/conversation'
import type { FloatingNote } from '@/types/notes'
import { fetchConversation } from '@/mocks/conversations'
import { useSidebar } from './SidebarContext'

interface ConversationContextValue {
  loading: boolean
  responding: boolean
  title: string
  subtitle: string
  messages: MessageData[]
  floatingNotes: FloatingNote[]
  inlineNotes: InlineNote[]
  sendMessage: (text: string) => void
  editMessage: (id: string, text: string) => void
  addNote: (kind: FloatingNote['kind'], x: number, y: number) => void
  moveNote: (id: string, x: number, y: number) => void
  updateNote: (id: string, text: string) => void
  deleteNote: (id: string) => void
  setInlineNote: (messageId: string, text: string) => void
  removeInlineNote: (messageId: string) => void
}

const ConversationContext = createContext<ConversationContextValue | null>(null)

let _noteId = 0
const makeNoteId = () => `note-${++_noteId}`

let _msgId = 0
const makeMsgId = () => `msg-new-${++_msgId}`

const NOTE_DEFAULTS: Record<FloatingNote['kind'], { w: number; rot: number }> = {
  sticky:   { w: 180, rot: -1.5 },
  scribble: { w: 220, rot: -2 },
}

const MOCK_REPLIES = [
  "That's a great question — let me break it down for you.",
  "Good thinking. The key thing to understand here is the relationship between structure and function.",
  "Exactly right. This connects directly to what we covered in the previous chapter.",
]

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  const { activeConversationId } = useSidebar()

  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(false)
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [messages, setMessages] = useState<MessageData[]>([])
  const [floatingNotes, setFloatingNotes] = useState<FloatingNote[]>([])
  const [inlineNotes, setInlineNotes] = useState<InlineNote[]>([])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetchConversation(activeConversationId).then(result => {
      if (cancelled || !result) return
      const { data, floatingNotes: notes } = result
      setTitle(data.title)
      setSubtitle(data.subtitle)
      setMessages(data.messages)
      setInlineNotes(data.inlineNotes)
      setFloatingNotes(notes)
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [activeConversationId])

  const sendMessage = useCallback((text: string) => {
    const userMsg: MessageData = { id: makeMsgId(), role: 'user', text }
    setMessages(ms => [...ms, userMsg])
    setResponding(true)

    setTimeout(() => {
      const reply = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)]
      const assistantMsg: MessageData = { id: makeMsgId(), role: 'assistant', text: reply }
      setMessages(ms => [...ms, assistantMsg])
      setResponding(false)
    }, 1800)
  }, [])

  const editMessage = useCallback((id: string, text: string) => {
    setMessages(ms => ms.map(m => m.id === id ? { ...m, text } : m))
  }, [])

  const addNote = useCallback((kind: FloatingNote['kind'], x: number, y: number) => {
    const note: FloatingNote = {
      id: makeNoteId(),
      conversationId: activeConversationId,
      kind,
      x,
      y,
      text: '',
      ...NOTE_DEFAULTS[kind],
    }
    setFloatingNotes(ns => [...ns, note])
  }, [activeConversationId])

  const moveNote = useCallback((id: string, x: number, y: number) => {
    setFloatingNotes(ns => ns.map(n => n.id === id ? { ...n, x, y } : n))
  }, [])

  const updateNote = useCallback((id: string, text: string) => {
    setFloatingNotes(ns => ns.map(n => n.id === id ? { ...n, text } : n))
  }, [])

  const deleteNote = useCallback((id: string) => {
    setFloatingNotes(ns => ns.filter(n => n.id !== id))
  }, [])

  const setInlineNote = useCallback((messageId: string, text: string) => {
    setInlineNotes(ns => {
      const exists = ns.find(n => n.messageId === messageId)
      if (exists) return ns.map(n => n.messageId === messageId ? { ...n, text } : n)
      return [...ns, { id: `inline-${messageId}`, messageId, text }]
    })
  }, [])

  const removeInlineNote = useCallback((messageId: string) => {
    setInlineNotes(ns => ns.filter(n => n.messageId !== messageId))
  }, [])

  return (
    <ConversationContext.Provider value={{
      loading, responding, title, subtitle,
      messages, floatingNotes, inlineNotes,
      sendMessage, editMessage,
      addNote, moveNote, updateNote, deleteNote,
      setInlineNote, removeInlineNote,
    }}>
      {children}
    </ConversationContext.Provider>
  )
}

export function useConversation() {
  const ctx = useContext(ConversationContext)
  if (!ctx) throw new Error('useConversation must be used within ConversationProvider')
  return ctx
}
