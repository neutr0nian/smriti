import { useRef, useEffect, useState } from 'react'
import './inline-note.css'

export default function InlineNote() {
  const [text, setText] = useState('')
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

  return (
    <div className="inline-note animate-slide-down">
      <span className="inline-note__label">Note</span>
      <textarea
        ref={textareaRef}
        className="inline-note__body"
        value={text}
        onChange={handleChange}
        placeholder="Write your note…"
        rows={1}
      />
    </div>
  )
}
