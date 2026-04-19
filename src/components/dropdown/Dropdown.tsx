import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import './dropdown.css'

export interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  options: DropdownOption[]
  label: string
  leading?: React.ReactNode
  value?: string
  onChange?: (value: string) => void
}

export default function Dropdown({ options, label, leading, value, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)
  const widestLabel = [label, ...options.map(o => o.label)]
    .reduce((a, b) => a.length > b.length ? a : b)

  useEffect(() => {
    if (!open) return
    const handleOutsideClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
  }

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="dropdown" onKeyDown={handleKeyDown}>
      <button
        type="button"
        className={`dropdown__trigger${open ? ' dropdown__trigger--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {leading && <span className="dropdown__leading">{leading}</span>}
        <span className="dropdown__label-wrapper">
          <span className="dropdown__label-sizer" aria-hidden="true">{widestLabel}</span>
          <span className={`dropdown__label${!selected ? ' dropdown__label--placeholder' : ''}`}>
            {selected ? selected.label : label}
          </span>
        </span>
        <span className={`dropdown__chevron${open ? ' dropdown__chevron--open' : ''}`}>
          <ChevronDown size={14} aria-hidden="true" />
        </span>
      </button>

      {open && (
        <ul className="dropdown__menu" role="listbox" aria-label={label}>
          {options.map(option => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              className={`dropdown__option${option.value === value ? ' dropdown__option--active' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
