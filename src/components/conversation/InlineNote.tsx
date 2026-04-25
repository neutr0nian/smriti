import { useRef, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import './inline-note.css'

interface InlineNoteProps {
  initialText?: string
  onSave: (text: string) => void
  onRemove: () => void
}

export default function InlineNote({ initialText = '', onSave, onRemove }: InlineNoteProps) {
  const [text, setText] = useState(initialText)
  const removingRef = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.focus()
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target
    setText(el.value)
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  const handleBlur = () => {
    if (removingRef.current) return
    if (text.trim()) {
      onSave(text)
    } else {
      onRemove()
    }
  }

  const handleDelete = () => {
    removingRef.current = true
    onRemove()
  }

  return (
    <div className="inline-note animate-slide-down">
      <div className="inline-note__header">
        <span className="inline-note__label">Note</span>
        <button
          type="button"
          className="inline-note__delete"
          onMouseDown={(e) => { e.preventDefault(); handleDelete() }}
          aria-label="Delete note"
        >
          <X size={12} aria-hidden="true" />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        className="inline-note__body"
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Write your note…"
        rows={1}
      />
    </div>
  )
}
