import { useState, useRef, useEffect, useCallback } from 'react'
import Button from '@/components/button/Button'
import './text-input.css'

interface TextInputProps {
  onSubmit?: (value: string) => void
  onCancel?: () => void
  placeholder?: string
  initialValue?: string
  submitLabel?: string
  variant?: 'fixed' | 'inline'
  disabled?: boolean
}

export default function TextInput({
  onSubmit,
  onCancel,
  placeholder = 'Ask anything…',
  initialValue = '',
  submitLabel = 'Ask',
  variant = 'fixed',
  disabled,
}: TextInputProps) {
  const [value, setValue] = useState(initialValue)
  const [multiLine, setMultiLine] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const singleLineHeight = useRef<number>(0)

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
    setMultiLine(el.scrollHeight > singleLineHeight.current)
  }, [])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    singleLineHeight.current = el.scrollHeight
    autoResize()
    el.selectionStart = el.selectionEnd = el.value.length
  }, [autoResize])

  const submitValue = useCallback((val: string) => {
    const trimmed = val.trim()
    if (!trimmed) return
    onSubmit?.(trimmed)
    if (variant !== 'inline') {
      setValue('')
      setMultiLine(false)
      requestAnimationFrame(() => {
        const el = textareaRef.current
        if (el) {
          el.style.height = 'auto'
          singleLineHeight.current = el.scrollHeight
        }
      })
    }
  }, [onSubmit, variant])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    autoResize()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitValue(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') { onCancel?.(); return }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submitValue(value)
    }
  }

  const form = (
    <form
      className={`text-input__form${multiLine ? ' text-input__form--multiline' : ''}`}
      onSubmit={handleSubmit}
    >
      <textarea
        ref={textareaRef}
        className="text-input__field"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={!!initialValue}
        rows={1}
      />
      <div className="text-input__actions">
        <Button text={submitLabel} color="accent" size="md" type="submit" disabled={disabled} />
      </div>
    </form>
  )

  if (variant === 'inline') return form

  return <div className="text-input">{form}</div>
}
