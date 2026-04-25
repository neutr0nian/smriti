import { BookOpen, PanelRight, SquarePen } from 'lucide-react'
import SidebarSection from './SidebarSection'
import Tooltip from '@/components/tooltip/Tooltip'
import { useSidebar } from '@/context/SidebarContext'
import './sidebar.css'

export default function Sidebar() {
  const { conversationList, activeConversationId, setActiveConversationId, collapsed, toggleSidebar } = useSidebar()

  const items = conversationList.map(c => ({ value: c.id, label: c.title }))

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

      <nav className="sidebar__nav">
        <SidebarSection
          label="Notes"
          icon={<SquarePen size={16} />}
          items={items}
          value={activeConversationId}
          onChange={setActiveConversationId}
          collapsed={collapsed}
          onExpand={toggleSidebar}
        />
      </nav>
    </aside>
  )
}
