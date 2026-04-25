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
  const { responding, responseError, title, subtitle, messages, sendMessage, editMessage, retryMessage } = useConversation()
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
            blocks={m.blocks}
            editing={editingId === m.id}
            versions={m.versions}
            versionIndex={m.versionIndex}
            onStartEdit={m.role === 'user' ? () => setEditingId(m.id) : undefined}
            onEdit={(text) => { editMessage(m.id, text); setEditingId(null) }}
            onCancelEdit={() => setEditingId(null)}
            onRetry={m.role === 'assistant' ? () => retryMessage(m.id) : undefined}
          />
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
      <TextInput onSubmit={sendMessage} disabled={responding} />
    </>
  )
}
