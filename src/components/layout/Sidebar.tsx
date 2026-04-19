import { useState } from 'react'
import { BookOpen, PanelRight, MessageSquare, SquarePen } from 'lucide-react'
import SidebarSection from './SidebarSection'
import './sidebar.css'

const CHAT_OPTIONS = [
  { value: 'c1', label: 'Light-dependent reactions' },
  { value: 'c2', label: 'Calvin Cycle overview' },
  { value: 'c3', label: 'Chloroplast structure' },
]

const NOTE_OPTIONS = [
  { value: 'n1', label: 'Photosystem II notes' },
  { value: 'n2', label: 'ATP synthesis summary' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [activeChat, setActiveChat] = useState('c1')
  const [activeNote, setActiveNote] = useState('n1')

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        <button
          type="button"
          className="sidebar__logo"
          onClick={collapsed ? onToggle : undefined}
          aria-label={collapsed ? 'Expand sidebar' : undefined}
        >
          <BookOpen size={18} aria-hidden="true" />
          <h3>Smriti</h3>
        </button>

        {!collapsed && (
          <button
            type="button"
            className="sidebar__collapse-btn"
            onClick={onToggle}
            aria-label="Collapse sidebar"
          >
            <PanelRight size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <nav className="sidebar__nav">
        <SidebarSection
          label="Chats"
          icon={<MessageSquare size={16} />}
          items={CHAT_OPTIONS}
          value={activeChat}
          onChange={setActiveChat}
          collapsed={collapsed}
          onExpand={onToggle}
        />
        <SidebarSection
          label="Notes"
          icon={<SquarePen size={16} />}
          items={NOTE_OPTIONS}
          value={activeNote}
          onChange={setActiveNote}
          collapsed={collapsed}
          onExpand={onToggle}
        />
      </nav>
    </aside>
  )
}
