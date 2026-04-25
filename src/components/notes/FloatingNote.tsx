import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import type { FloatingNote as FloatingNoteData } from '@/types/notes'
import './floating-note.css'

interface FloatingNoteProps {
  note: FloatingNoteData
  editing: boolean
  onEdit: () => void
  onBlur: (text: string) => void
  onDelete: () => void
  onDragStart: (e: React.MouseEvent, dx: number, dy: number) => void
  onResizeStart: (e: React.MouseEvent, currentW: number, currentH: number) => void
}

const PLACEHOLDER: Record<FloatingNoteData['kind'], string> = {
  sticky: 'type a sticky…',
  scribble: 'scribble a note…',
}

export default function FloatingNote({ note, editing, onEdit, onBlur, onDelete, onDragStart, onResizeStart }: FloatingNoteProps) {
  const [hover, setHover] = useState(false)
  const noteRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!editing || !bodyRef.current) return
    bodyRef.current.focus()
    const range = document.createRange()
    range.selectNodeContents(bodyRef.current)
    range.collapse(false)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  }, [editing])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (editing) return
    const rect = e.currentTarget.getBoundingClientRect()
    onDragStart(e, e.clientX - rect.left, e.clientY - rect.top)
  }

  const showPlaceholder = !note.text && !editing

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!noteRef.current) return
    const rect = noteRef.current.getBoundingClientRect()
    onResizeStart(e, rect.width, rect.height)
  }

  return (
    <div
      ref={noteRef}
      className={`floating-note floating-note--${note.kind}${editing ? ' floating-note--editing' : ''}`}
      style={{
        left: note.x,
        top: note.y,
        width: note.w,
        ...(note.h !== undefined && { height: note.h }),
        transform: `rotate(${note.rot}deg)`,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={(e) => { e.stopPropagation(); onEdit() }}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        ref={bodyRef}
        contentEditable={editing}
        suppressContentEditableWarning
        className={`floating-note__body${showPlaceholder ? ' floating-note__body--placeholder' : ''}`}
        onBlur={(e) => onBlur(e.currentTarget.textContent ?? '')}
        onKeyDown={(e) => { if (e.key === 'Escape') (e.currentTarget as HTMLElement).blur() }}
        onMouseDown={(e) => { if (editing) e.stopPropagation() }}
      >
        {showPlaceholder ? PLACEHOLDER[note.kind] : note.text}
      </div>

      {hover && !editing && (
        <button
          type="button"
          className="floating-note__delete"
          onMouseDown={(e) => { e.stopPropagation(); onDelete() }}
          aria-label="Delete note"
        >
          <X size={10} aria-hidden="true" />
        </button>
      )}

      <div
        className="floating-note__resize"
        onMouseDown={handleResizeMouseDown}
        aria-hidden="true"
      />
    </div>
  )
}
