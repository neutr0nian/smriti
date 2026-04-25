import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Tooltip from '@/components/tooltip/Tooltip'
import './toolbar.css'

export interface ToolbarButton {
  kind?: 'button'
  icon: ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
}

export interface ToolbarCustom {
  kind: 'custom'
  render: () => ReactNode
}

export interface ToolbarGroup {
  kind: 'group'
  bordered?: boolean
  items: Array<ToolbarButton | ToolbarCustom>
}

export type ToolbarTool = ToolbarButton | ToolbarCustom | ToolbarGroup

interface ToolbarProps {
  x: number
  y: number
  placement?: 'below' | 'above-centered'
  tools: ToolbarTool[]
  onClose: () => void
}

function renderItem(item: ToolbarButton | ToolbarCustom, key: number) {
  if (item.kind === 'custom') return <span key={key}>{item.render()}</span>
  return (
    <Tooltip key={key} content={item.label} placement="top">
      <button
        type="button"
        className="toolbar__btn"
        onClick={item.onClick}
        disabled={item.disabled}
        aria-label={item.label}
      >
        {item.icon}
      </button>
    </Tooltip>
  )
}

export default function Toolbar({ x, y, placement = 'below', tools, onClose }: ToolbarProps) {
  useEffect(() => {
    const close = () => onClose()
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [onClose])

  return createPortal(
    <div
      className={`toolbar toolbar--${placement} animate-scale-in`}
      style={{ top: y, left: x }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {tools.map((tool, i) => {
        if ('items' in tool) {
          return (
            <div key={i} className={`toolbar__group${tool.bordered ? ' toolbar__group--bordered' : ''}`}>
              {tool.items.map((it, j) => renderItem(it, j))}
            </div>
          )
        }
        return renderItem(tool, i)
      })}
    </div>,
    document.body,
  )
}
