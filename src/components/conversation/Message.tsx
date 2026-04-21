import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { duration } from '@/tokens'
import TextInput from '@/components/input/TextInput'
import InlineNote from './InlineNote'
import MessageToolbar from './MessageToolbar'
import { useConversation } from '@/context/ConversationContext'
import './message.css'

interface MessageProps {
  messageId: string
  role: 'user' | 'assistant'
  children: React.ReactNode
  editing?: boolean
  versions?: string[]
  versionIndex?: number
  onStartEdit?: () => void
  onEdit?: (text: string) => void
  onCancelEdit?: () => void
  onRetry?: () => void
}

export default function Message({
  messageId, role, children, editing,
  versions, versionIndex = 0,
  onStartEdit, onEdit, onCancelEdit, onRetry,
}: MessageProps) {
  const { inlineNotes, setInlineNote, removeInlineNote } = useConversation()

  const existingNote = inlineNotes.find(n => n.messageId === messageId)
  const [localOpen, setLocalOpen] = useState(false)
  const showNote = !!existingNote || localOpen

  const [exiting, setExiting] = useState(false)
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)
  const [toolbar, setToolbar] = useState<{ x: number; y: number } | null>(null)
  const prevVersionIndex = useRef(versionIndex)

  useEffect(() => {
    if (!editing) setExiting(false)
  }, [editing])

  useEffect(() => {
    if (versionIndex === prevVersionIndex.current) return
    setSlideDir(versionIndex > prevVersionIndex.current ? 'left' : 'right')
    prevVersionIndex.current = versionIndex
    const t = setTimeout(() => setSlideDir(null), parseInt(duration.fast))
    return () => clearTimeout(t)
  }, [versionIndex])

  useEffect(() => {
    if (!toolbar) return
    const close = () => setToolbar(null)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [toolbar])

  const handleClose = (action: () => void) => {
    setExiting(true)
    setTimeout(action, parseInt(duration.fast))
  }

  const handleBodyClick = (e: React.MouseEvent) => {
    if (editing) return
    e.stopPropagation()
    setToolbar(t => t ? null : { x: e.clientX, y: e.clientY })
  }

  return (
    <div className="message">
      <div className={`message__header message__header--${role}`}>
        {role === 'user' ? 'Question' : 'Answer'}
      </div>

      {editing || exiting ? (
        <div className={exiting ? 'animate-slide-up-out' : 'animate-slide-down'}>
          <TextInput
            variant="inline"
            initialValue={typeof children === 'string' ? children : ''}
            onSubmit={(text) => handleClose(() => onEdit?.(text))}
            onCancel={() => handleClose(() => onCancelEdit?.())}
            submitLabel="Save"
            placeholder="Edit your message…"
          />
        </div>
      ) : (
        <div
          key={versionIndex}
          className={`message__body${role === 'assistant' ? ' message__body--markdown' : ''}${slideDir ? ` animate-slide-${slideDir}` : ''}`}
          onClick={handleBodyClick}
        >
          {role === 'assistant'
            ? <ReactMarkdown>{typeof children === 'string' ? children : ''}</ReactMarkdown>
            : children}
        </div>
      )}

      {toolbar && (
        <MessageToolbar
          messageId={messageId}
          role={role}
          x={toolbar.x}
          y={toolbar.y}
          versions={versions}
          versionIndex={versionIndex}
          onEdit={onStartEdit}
          onNote={() => setLocalOpen(o => !o)}
          onRetry={onRetry}
          onClose={() => setToolbar(null)}
        />
      )}

      {showNote && (
        <InlineNote
          initialText={existingNote?.text}
          onSave={(text) => { setInlineNote(messageId, text); setLocalOpen(false) }}
          onRemove={() => { removeInlineNote(messageId); setLocalOpen(false) }}
        />
      )}
    </div>
  )
}
