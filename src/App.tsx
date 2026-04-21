import { useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import NotebookPage from '@/components/layout/NotebookPage'
import ConversationTitle from '@/components/conversation/ConversationTitle'
import Conversation from '@/components/conversation/Conversation'
import Message from '@/components/conversation/Message'
import TextInput from '@/components/input/TextInput'
import LoaderIcon from '@/components/loader/LoaderIcon'
import { ConversationProvider, useConversation } from '@/context/ConversationContext'
import './app.css'

export default function App() {
  return (
    <AppShell>
      <ConversationProvider>
        <NotebookPage>
          <PageContent />
        </NotebookPage>
      </ConversationProvider>
    </AppShell>
  )
}

function PageContent() {
  const { responding, responseError, title, subtitle, messages, sendMessage, editMessage } = useConversation()
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <>
      <ConversationTitle subject={subtitle} title={title} />
      <Conversation>
        {messages.map(m => (
          <Message
            key={m.id}
            messageId={m.id}
            role={m.role}
            editing={editingId === m.id}
            onStartEdit={m.role === 'user' ? () => setEditingId(m.id) : undefined}
            onEdit={(text) => { editMessage(m.id, text); setEditingId(null) }}
            onCancelEdit={() => setEditingId(null)}
          >
            {m.text}
          </Message>
        ))}
        {responding && (
          <div className="response-loader">
            <LoaderIcon size={20} color="var(--color-ink-muted)" />
          </div>
        )}
        {responseError && (
          <div className="response-error">{responseError}</div>
        )}
      </Conversation>
      <TextInput onSubmit={sendMessage} />
    </>
  )
}
