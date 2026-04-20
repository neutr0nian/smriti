import { useState, useEffect } from 'react'
import { duration } from '@/tokens'
import TextInput from '@/components/input/TextInput'
import Tooltip from '@/components/tooltip/Tooltip'
import GapPlus from './GapPlus'
import InlineNote from './InlineNote'
import './message.css'

interface MessageProps {
  role: 'user' | 'assistant'
  children: React.ReactNode
  editing?: boolean
  onStartEdit?: () => void
  onEdit?: (text: string) => void
  onCancelEdit?: () => void
}

export default function Message({ role, children, editing, onStartEdit, onEdit, onCancelEdit }: MessageProps) {
  const isEditable = role === 'user' && !!onStartEdit

  // Derive message id from children text — stable as long as text doesn't change before save
  // The actual id is passed via the key in the parent; we need it here for note lookup.
  // We receive it indirectly: parent sets key={m.id} but we need to pass id explicitly.
  // For now we track note presence locally and delegate text to context via props.
  const [exiting, setExiting] = useState(false)
  const [showNote, setShowNote] = useState(false)

  useEffect(() => {
    if (!editing) setExiting(false)
  }, [editing])

  const handleClose = (action: () => void) => {
    setExiting(true)
    setTimeout(action, parseInt(duration.fast))
  }

  return (
    <div className="message">
      <div className={`message__header message__header--${role}`}>
        {role === 'user' ? 'You' : 'Assistant'}
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
        <>
          {isEditable ? (
            <Tooltip content="Edit message" placement="top">
              <div
                className="message__body message__body--editable"
                onClick={onStartEdit}
              >
                {children}
              </div>
            </Tooltip>
          ) : (
            <div className="message__body">{children}</div>
          )}
        </>
      )}

      {!editing && !exiting && (
        <>
          {!showNote && <GapPlus onAdd={() => setShowNote(true)} />}
          {showNote && (
            <InlineNote
              onSave={() => setShowNote(true)}
              onRemove={() => setShowNote(false)}
            />
          )}
        </>
      )}
    </div>
  )
}
