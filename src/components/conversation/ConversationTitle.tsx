import { useEffect, useRef, useState } from 'react'
import { Pencil, Sparkles } from 'lucide-react'
import Toolbar, { type ToolbarTool } from '@/components/toolbar/Toolbar'
import Tooltip from '@/components/tooltip/Tooltip'
import { useSidebar } from '@/context/SidebarContext'
import './conversation-title.css'

export default function ConversationTitle() {
  const {
    activeConversationId, conversationList,
    updateConversationTitle, generateConversationTitle,
  } = useSidebar()

  const conversation = conversationList.find(c => c.id === activeConversationId)
  const title = conversation?.title ?? ''
  const subject = conversation?.subtitle ?? ''

  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleHeadingClick = (e: React.MouseEvent) => {
    if (editing) return
    e.stopPropagation()
    setMenu(m => m ? null : { x: e.clientX, y: e.clientY })
  }

  const startEdit = () => {
    setEditText(title)
    setEditing(true)
  }

  const commitEdit = () => {
    const trimmed = editText.trim()
    if (trimmed && trimmed !== title && activeConversationId) {
      void updateConversationTitle(activeConversationId, trimmed)
    }
    setEditing(false)
  }

  if (!activeConversationId) return null

  return (
    <div className="conversation-title">
      <h6 className="conversation-title__subject">{subject}</h6>
      {editing ? (
        <input
          ref={inputRef}
          className="conversation-title__edit"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitEdit()
            else if (e.key === 'Escape') setEditing(false)
          }}
        />
      ) : (
        <Tooltip content="Rename" placement="right">
          <h1 className="conversation-title__heading" onClick={handleHeadingClick}>
            {title}
          </h1>
        </Tooltip>
      )}

      {menu && (() => {
        const close = () => setMenu(null)
        const tools: ToolbarTool[] = [
          { icon: <Pencil size={14} />, label: 'Rename', onClick: () => { close(); startEdit() } },
          { icon: <Sparkles size={14} />, label: 'Generate title with AI', onClick: () => { close(); void generateConversationTitle(activeConversationId) } },
        ]
        return (
          <Toolbar
            x={menu.x}
            y={menu.y}
            placement="above-centered"
            tools={tools}
            onClose={close}
          />
        )
      })()}
    </div>
  )
}
