import { useState, useRef, useEffect, useCallback } from 'react'
import NoteToolbar from '@/components/notes/NoteToolbar'
import FloatingNote from '@/components/notes/FloatingNote'
import { useConversation } from '@/context/ConversationContext'
import './notebook-page.css'

interface NotebookPageProps {
  children: React.ReactNode
}

export default function NotebookPage({ children }: NotebookPageProps) {
  const { floatingNotes, addNote, moveNote, commitNoteMove, resizeNote, commitNoteResize, updateNote, deleteNote } = useConversation()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [toolbar, setToolbar] = useState<{ x: number; y: number } | null>(null)
  const [dragging, setDragging] = useState<{ id: string; dx: number; dy: number } | null>(null)
  const [resizing, setResizing] = useState<{ id: string; startX: number; startY: number; startW: number; startH: number } | null>(null)

  const paperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const lastDragPosRef = useRef<{ x: number; y: number } | null>(null)
  const lastResizeSizeRef = useRef<{ w: number; h: number } | null>(null)

  // ── Drag ──
  useEffect(() => {
    if (!dragging) return
    const getPos = (e: MouseEvent | TouchEvent) => {
      const src = e instanceof TouchEvent ? (e.touches[0] ?? e.changedTouches[0]) : e
      return { clientX: src?.clientX ?? 0, clientY: src?.clientY ?? 0 }
    }
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!paperRef.current) return
      const { clientX, clientY } = getPos(e)
      const paperRect = paperRef.current.getBoundingClientRect()
      const x = clientX - paperRect.left - dragging.dx
      const y = clientY - paperRect.top - dragging.dy
      lastDragPosRef.current = { x, y }
      moveNote(dragging.id, x, y)
    }
    const onUp = () => {
      const pos = lastDragPosRef.current
      if (pos) void commitNoteMove(dragging.id, pos.x, pos.y)
      lastDragPosRef.current = null
      setDragging(null)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onUp)
    }
  }, [dragging, moveNote, commitNoteMove])

  // ── Resize ──
  useEffect(() => {
    if (!resizing) return
    const getPos = (e: MouseEvent | TouchEvent) => {
      const src = e instanceof TouchEvent ? (e.touches[0] ?? e.changedTouches[0]) : e
      return { clientX: src?.clientX ?? 0, clientY: src?.clientY ?? 0 }
    }
    const onMove = (e: MouseEvent | TouchEvent) => {
      const { clientX, clientY } = getPos(e)
      const dw = clientX - resizing.startX
      const dh = clientY - resizing.startY
      const w = Math.max(80, resizing.startW + dw)
      const h = Math.max(40, resizing.startH + dh)
      lastResizeSizeRef.current = { w, h }
      resizeNote(resizing.id, w, h)
    }
    const onUp = () => {
      const size = lastResizeSizeRef.current
      if (size) void commitNoteResize(resizing.id, size.w, size.h)
      lastResizeSizeRef.current = null
      setResizing(null)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onUp)
    }
  }, [resizing, resizeNote, commitNoteResize])

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
      setToolbar({ x: e.clientX - paperRect.left, y: e.clientY - paperRect.top })
    } else {
      setToolbar(null)
    }
  }

  const handleAddNote = (kind: 'sticky' | 'scribble') => {
    if (!toolbar) return
    addNote(kind, toolbar.x, toolbar.y)
    setToolbar(null)
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

          {floatingNotes.map(note => (
            <FloatingNote
              key={note.id}
              note={note}
              editing={editingId === note.id}
              onEdit={() => setEditingId(note.id)}
              onBlur={(text) => { updateNote(note.id, text); setEditingId(null) }}
              onDelete={() => deleteNote(note.id)}
              onDragStart={(dx, dy) => setDragging({ id: note.id, dx, dy })}
              onResizeStart={(startX, startY, w, h) => setResizing({ id: note.id, startX, startY, startW: w, startH: h })}
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
