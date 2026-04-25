import { BookOpen, PanelRight, Plus } from 'lucide-react'
import SidebarItemList from './SidebarItemList'
import Tooltip from '@/components/tooltip/Tooltip'
import { useSidebar } from '@/context/SidebarContext'
import './sidebar.css'

export default function Sidebar() {
  const {
    conversationList, activeConversationId, setActiveConversationId,
    collapsed, toggleSidebar, addConversation,
    updateConversationTitle, removeConversation, generateConversationTitle,
  } = useSidebar()

  const items = conversationList.map(c => ({ value: c.id, label: c.title }))

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this chat? This cannot be undone.')) {
      void removeConversation(id)
    }
  }

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        <button
          type="button"
          className="sidebar__logo"
          onClick={collapsed ? toggleSidebar : undefined}
          aria-label={collapsed ? 'Expand sidebar' : undefined}
        >
          <BookOpen size={18} aria-hidden="true" />
          <h3>Rancho</h3>
        </button>

        {!collapsed && (
          <Tooltip content="Collapse sidebar" placement="right">
            <button
              type="button"
              className="sidebar__collapse-btn"
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
            >
              <PanelRight size={16} aria-hidden="true" />
            </button>
          </Tooltip>
        )}
      </div>

      <button
        type="button"
        className="sidebar__new-chat"
        onClick={() => { void addConversation() }}
        aria-label="New chat"
      >
        <Plus size={16} aria-hidden="true" />
        {!collapsed && <span>New chat</span>}
      </button>

      {!collapsed && (
        <>
          <div className="sidebar__divider" />
          <nav className="sidebar__nav">
            <SidebarItemList
              items={items}
              value={activeConversationId}
              onChange={setActiveConversationId}
              onItemRename={(id, title) => { void updateConversationTitle(id, title) }}
              onItemGenerate={(id) => { void generateConversationTitle(id) }}
              onItemDelete={handleDelete}
            />
          </nav>
        </>
      )}
    </aside>
  )
}
