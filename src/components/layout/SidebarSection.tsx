import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import './sidebar-section.css'

interface SidebarSectionItem {
  value: string
  label: string
}

interface SidebarSectionProps {
  label: string
  icon: React.ReactNode
  items: SidebarSectionItem[]
  value: string
  onChange: (value: string) => void
  collapsed?: boolean
  onExpand?: () => void
}

export default function SidebarSection({ label, icon, items, value, onChange, collapsed, onExpand }: SidebarSectionProps) {
  const [open, setOpen] = useState(true)

  const handleHeaderClick = () => {
    if (collapsed) {
      onExpand?.()
      setOpen(true)
    } else {
      setOpen(o => !o)
    }
  }

  return (
    <div className={`sidebar-section${open ? ' sidebar-section--open' : ''}`}>
      <button
        type="button"
        className="sidebar-section__header"
        onClick={handleHeaderClick}
        aria-expanded={open}
      >
        <span className="sidebar-section__icon">{icon}</span>
        <span className="sidebar-section__label">{label}</span>
        <span className="sidebar-section__chevron">
          <ChevronDown size={12} aria-hidden="true" />
        </span>
      </button>

      <ul className="sidebar-section__items">
        {items.map(item => (
          <li
            key={item.value}
            className={`sidebar-section__item${item.value === value ? ' sidebar-section__item--active' : ''}`}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
