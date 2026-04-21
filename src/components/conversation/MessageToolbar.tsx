import { createPortal } from 'react-dom'
import { Pencil, RotateCcw, StickyNote, ChevronLeft, ChevronRight } from 'lucide-react'
import Tooltip from '@/components/tooltip/Tooltip'
import { useConversation } from '@/context/ConversationContext'
import './message-toolbar.css'

interface MessageToolbarProps {
  messageId: string
  role: 'user' | 'assistant'
  x: number
  y: number
  versions?: string[]
  versionIndex?: number
  onEdit?: () => void
  onNote?: () => void
  onRetry?: () => void
  onClose?: () => void
}

export default function MessageToolbar({
  messageId, role, x, y,
  versions, versionIndex = 0,
  onEdit, onNote, onRetry, onClose,
}: MessageToolbarProps) {
  const { setVersionIndex } = useConversation()
  const hasVersions = !!versions && versions.length > 1

  const handle = (action?: () => void) => {
    action?.()
    onClose?.()
  }

  return createPortal(
    <div
      className="message-toolbar animate-scale-in"
      style={{ top: y, left: x }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {role === 'user' && (
        <Tooltip content="Edit" placement="top">
          <button type="button" className="message-toolbar__btn" onClick={() => handle(onEdit)} aria-label="Edit">
            <Pencil size={14} />
          </button>
        </Tooltip>
      )}
      <Tooltip content="Add note" placement="top">
        <button type="button" className="message-toolbar__btn" onClick={() => handle(onNote)} aria-label="Add note">
          <StickyNote size={14} />
        </button>
      </Tooltip>
      {hasVersions && (
        <div className="message-toolbar__carousel">
          <button
            type="button"
            className="message-toolbar__btn"
            onClick={() => setVersionIndex(messageId, versionIndex - 1)}
            disabled={versionIndex === 0}
            aria-label="Previous version"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="message-toolbar__counter">{versionIndex + 1}/{versions!.length}</span>
          <button
            type="button"
            className="message-toolbar__btn"
            onClick={() => setVersionIndex(messageId, versionIndex + 1)}
            disabled={versionIndex === versions!.length - 1}
            aria-label="Next version"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
      {onRetry && (
        <Tooltip content="Retry" placement="top">
          <button type="button" className="message-toolbar__btn" onClick={() => handle(onRetry)} aria-label="Retry">
            <RotateCcw size={14} />
          </button>
        </Tooltip>
      )}
    </div>,
    document.body
  )
}
