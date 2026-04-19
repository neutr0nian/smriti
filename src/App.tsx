import { useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import NotebookPage from '@/components/layout/NotebookPage'
import ConversationTitle from '@/components/conversation/ConversationTitle'
import Conversation from '@/components/conversation/Conversation'
import Message from '@/components/conversation/Message'
import TextInput from '@/components/input/TextInput'
import Dropdown from '@/components/dropdown/Dropdown'
import type { MessageData } from '@/types/conversation'

const CHAPTER_OPTIONS = [
  { value: 'ch1', label: 'Ch. 1 · Introduction' },
  { value: 'ch2', label: 'Ch. 2 · Chloroplast Structure' },
  { value: 'ch3', label: 'Ch. 3 · Light Reactions' },
  { value: 'ch4', label: 'Ch. 4 · Calvin Cycle' },
]

const INITIAL_MESSAGES: MessageData[] = [
  {
    id: '1',
    role: 'user',
    text: "I'm trying to understand the light-dependent reactions of photosynthesis. Can you walk me through the big picture first?",
  },
  {
    id: '2',
    role: 'assistant',
    text: "Sure — the light-dependent reactions are the first stage of photosynthesis, and their job is to convert light energy into chemical energy that the second stage (the Calvin cycle) can use.",
  },
]

export default function App() {
  const [messages, setMessages] = useState<MessageData[]>(INITIAL_MESSAGES)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [chapter, setChapter] = useState<string>('ch3')

  const handleEdit = (id: string, text: string) => {
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, text } : m))
    setEditingId(null)
  }

  return (
    <AppShell>
    <NotebookPage>
      <ConversationTitle
        subject="Photosynthesis · Ch. 3"
        title="Light-dependent reactions"
      />
      <Conversation>
        {messages.map(m => (
          <Message
            key={m.id}
            role={m.role}
            editing={editingId === m.id}
            onStartEdit={m.role === 'user' ? () => setEditingId(m.id) : undefined}
            onEdit={(text) => handleEdit(m.id, text)}
            onCancelEdit={() => setEditingId(null)}
          >
            {m.text}
          </Message>
        ))}
      </Conversation>
      <TextInput />
    </NotebookPage>
    </AppShell>
  )
}
