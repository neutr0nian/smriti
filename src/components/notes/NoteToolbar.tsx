import { StickyNote, PenLine, X } from 'lucide-react'
import Tooltip from '@/components/tooltip/Tooltip'
import './note-toolbar.css'

interface NoteToolbarProps {
  x: number
  y: number
  onAdd: (kind: 'sticky' | 'scribble') => void
  onClose: () => void
}

export default function NoteToolbar({ x, y, onAdd, onClose }: NoteToolbarProps) {
  return (
    <div
      className="note-toolbar"
      style={{ left: x, top: y }}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <Tooltip content="Sticky note" placement="bottom">
        <button
          type="button"
          className="note-toolbar__btn"
          onClick={() => onAdd('sticky')}
          aria-label="Sticky note"
        >
          <StickyNote size={14} aria-hidden="true" />
        </button>
      </Tooltip>
      <Tooltip content="Scribble" placement="bottom">
        <button
          type="button"
          className="note-toolbar__btn"
          onClick={() => onAdd('scribble')}
          aria-label="Scribble"
        >
          <PenLine size={14} aria-hidden="true" />
        </button>
      </Tooltip>
      <div className="note-toolbar__divider" />
      <Tooltip content="Close" placement="bottom">
        <button
          type="button"
          className="note-toolbar__close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={13} aria-hidden="true" />
        </button>
      </Tooltip>
    </div>
  )
}
