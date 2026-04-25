import { useEffect, useRef, useState } from 'react'
import { EllipsisVertical, Pencil, Sparkles, Trash2 } from 'lucide-react'
import Toolbar, { type ToolbarTool } from '@/components/toolbar/Toolbar'
import './sidebar-item-list.css'

interface SidebarItem {
  value: string
  label: string
}

interface SidebarItemListProps {
  items: SidebarItem[]
  value: string
  onChange: (value: string) => void
  onItemRename?: (value: string, label: string) => void
  onItemGenerate?: (value: string) => void
  onItemDelete?: (value: string) => void
}

interface MenuState {
  value: string
  x: number
  y: number
}

export default function SidebarItemList({
  items, value, onChange,
  onItemRename, onItemGenerate, onItemDelete,
}: SidebarItemListProps) {
  const [menu, setMenu] = useState<MenuState | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  const handleItemClick = (item: SidebarItem) => {
    if (editingId === item.value) return
    onChange(item.value)
  }

  const handleKebabClick = (e: React.MouseEvent, item: SidebarItem) => {
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setMenu({ value: item.value, x: rect.right, y: rect.bottom + 4 })
  }

  const startEdit = (item: SidebarItem) => {
    setMenu(null)
    setEditingId(item.value)
    setEditText(item.label)
  }

  const commitEdit = () => {
    if (!editingId) return
    const trimmed = editText.trim()
    const original = items.find(i => i.value === editingId)?.label
    if (trimmed && trimmed !== original) onItemRename?.(editingId, trimmed)
    setEditingId(null)
  }

  const cancelEdit = () => setEditingId(null)

  return (
    <>
      <ul className="sidebar-item-list">
        {items.map(item => {
          const isEditing = editingId === item.value
          return (
            <li
              key={item.value}
              className={`sidebar-item-list__item${item.value === value ? ' sidebar-item-list__item--active' : ''}`}
              onClick={() => handleItemClick(item)}
            >
              {isEditing ? (
                <input
                  ref={inputRef}
                  className="sidebar-item-list__edit"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEdit()
                    else if (e.key === 'Escape') cancelEdit()
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span className="sidebar-item-list__item-label">{item.label}</span>
                  <button
                    type="button"
                    className="sidebar-item-list__kebab"
                    onClick={(e) => handleKebabClick(e, item)}
                    onMouseDown={(e) => e.stopPropagation()}
                    aria-label="More actions"
                  >
                    <EllipsisVertical size={14} aria-hidden="true" />
                  </button>
                </>
              )}
            </li>
          )
        })}
      </ul>

      {menu && (() => {
        const close = () => setMenu(null)
        const item = items.find(i => i.value === menu.value)
        const tools: ToolbarTool[] = [
          { icon: <Pencil size={14} />, label: 'Rename', onClick: () => { close(); if (item) startEdit(item) } },
          { icon: <Sparkles size={14} />, label: 'Generate title with AI', onClick: () => { close(); onItemGenerate?.(menu.value) } },
          { icon: <Trash2 size={14} />, label: 'Delete', onClick: () => { close(); onItemDelete?.(menu.value) } },
        ]
        return <Toolbar x={menu.x} y={menu.y} tools={tools} onClose={close} />
      })()}
    </>
  )
}
