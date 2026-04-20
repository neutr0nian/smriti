import { useRef, useEffect, useState } from 'react'
import './inline-note.css'

interface InlineNoteProps {
  initialText?: string
  onSave: (text: string) => void
  onRemove: () => void
}

export default function InlineNote({ initialText = '', onSave, onRemove }: InlineNoteProps) {
  const [text, setText] = useState(initialText)
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
    if (text.trim()) {
      onSave(text)
    } else {
      onRemove()
    }
  }

  return (
    <div className="inline-note animate-slide-down">
      <span className="inline-note__label">Note</span>
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
