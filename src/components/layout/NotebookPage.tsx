import { useState, useRef, useEffect, useCallback } from 'react'
import NoteToolbar from '@/components/notes/NoteToolbar'
import FloatingNote from '@/components/notes/FloatingNote'
import type { FloatingNote as FloatingNoteData } from '@/types/notes'
import './notebook-page.css'

interface NotebookPageProps {
  children: React.ReactNode
}

let _noteId = 0
const makeId = () => `note-${++_noteId}`

const NOTE_DEFAULTS: Record<FloatingNoteData['kind'], { w: number; rot: number }> = {
  sticky:  { w: 180, rot: -1.5 },
  scribble: { w: 220, rot: -2 },
}

export default function NotebookPage({ children }: NotebookPageProps) {
  const [notes, setNotes] = useState<FloatingNoteData[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [toolbar, setToolbar] = useState<{ x: number; y: number } | null>(null)
  const [dragging, setDragging] = useState<{ id: string; dx: number; dy: number } | null>(null)

  const paperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // ── Drag ──
  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      if (!paperRef.current) return
      const paperRect = paperRef.current.getBoundingClientRect()
      const x = Math.max(0, e.clientX - paperRect.left - dragging.dx)
      const y = Math.max(0, e.clientY - paperRect.top - dragging.dy)
      setNotes(ns => ns.map(n => n.id === dragging.id ? { ...n, x, y } : n))
    }
    const onUp = () => setDragging(null)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [dragging])

  // ── Zone detection ──
  const isInStickyZone = useCallback((clientX: number): boolean => {
    if (!contentRef.current) return false
    const rect = contentRef.current.getBoundingClientRect()
    return clientX < rect.left - 24 || clientX > rect.right + 24
  }, [])

  const handlePaperMouseMove = (e: React.MouseEvent) => {
    paperRef.current?.classList.toggle('notebook-page__paper--sticky-zone', isInStickyZone(e.clientX))
  }

  const handlePaperMouseLeave = () => {
    paperRef.current?.classList.remove('notebook-page__paper--sticky-zone')
  }

  const handlePaperClick = (e: React.MouseEvent) => {
    if (!paperRef.current) return
    if (isInStickyZone(e.clientX)) {
      const paperRect = paperRef.current.getBoundingClientRect()
      setToolbar({
        x: e.clientX - paperRect.left,
        y: e.clientY - paperRect.top,
      })
    } else {
      setToolbar(null)
    }
  }

  const handleAddNote = (kind: FloatingNoteData['kind']) => {
    if (!toolbar) return
    const id = makeId()
    setNotes(ns => [...ns, { id, kind, x: toolbar.x, y: toolbar.y, text: '', ...NOTE_DEFAULTS[kind] }])
    setToolbar(null)
    setEditingId(id)
  }

  return (
    <div className="notebook-page">
      <main className="notebook-page__desk">
        <div
          ref={paperRef}
          className="notebook-page__paper"
          onMouseMove={handlePaperMouseMove}
          onMouseLeave={handlePaperMouseLeave}
          onClick={handlePaperClick}
        >
          <div className="notebook-page__margin-rule" />

          <div ref={contentRef} className="notebook-page__content">
            {children}
          </div>

          <p className="notebook-page__page-number">— 1 —</p>

          {notes.map(note => (
            <FloatingNote
              key={note.id}
              note={note}
              editing={editingId === note.id}
              onEdit={() => setEditingId(note.id)}
              onBlur={(text) => {
                setNotes(ns => ns.map(n => n.id === note.id ? { ...n, text } : n))
                setEditingId(null)
              }}
              onDelete={() => setNotes(ns => ns.filter(n => n.id !== note.id))}
              onDragStart={(e, dx, dy) => {
                e.stopPropagation()
                setDragging({ id: note.id, dx, dy })
              }}
            />
          ))}

          {toolbar && (
            <NoteToolbar
              x={toolbar.x}
              y={toolbar.y}
              onAdd={handleAddNote}
              onClose={() => setToolbar(null)}
            />
          )}
        </div>
      </main>
    </div>
  )
}
