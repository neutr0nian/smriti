import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import './tooltip.css'

type Placement = 'top' | 'bottom' | 'left' | 'right'

interface TooltipProps {
  content: string
  placement?: Placement
  children: React.ReactElement
}

interface Position {
  top: number
  left: number
}

const GAP = 8

function getPosition(anchor: DOMRect, tooltip: DOMRect, placement: Placement): Position {
  switch (placement) {
    case 'top':
      return {
        top: anchor.top - tooltip.height - GAP,
        left: anchor.left + anchor.width / 2 - tooltip.width / 2,
      }
    case 'bottom':
      return {
        top: anchor.bottom + GAP,
        left: anchor.left + anchor.width / 2 - tooltip.width / 2,
      }
    case 'left':
      return {
        top: anchor.top + anchor.height / 2 - tooltip.height / 2,
        left: anchor.left - tooltip.width - GAP,
      }
    case 'right':
      return {
        top: anchor.top + anchor.height / 2 - tooltip.height / 2,
        left: anchor.right + GAP,
      }
  }
}

export default function Tooltip({ content, placement = 'top', children }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState<Position>({ top: 0, left: 0 })
  const anchorRef = useRef<HTMLElement>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)

  const reposition = useCallback(() => {
    if (!anchorRef.current || !bubbleRef.current) return
    const anchor = anchorRef.current.getBoundingClientRect()
    const bubble = bubbleRef.current.getBoundingClientRect()
    setPos(getPosition(anchor, bubble, placement))
  }, [placement])

  useEffect(() => {
    if (visible) reposition()
  }, [visible, reposition])

  const child = children as React.ReactElement<{
    ref?: React.Ref<HTMLElement>
    onMouseEnter?: React.MouseEventHandler
    onMouseLeave?: React.MouseEventHandler
    onFocus?: React.FocusEventHandler
    onBlur?: React.FocusEventHandler
  }>

  const anchor = {
    ...child,
    props: {
      ...child.props,
      ref: anchorRef,
      onMouseEnter: (e: React.MouseEvent) => { setVisible(true); child.props.onMouseEnter?.(e) },
      onMouseLeave: (e: React.MouseEvent) => { setVisible(false); child.props.onMouseLeave?.(e) },
      onFocus: (e: React.FocusEvent) => { setVisible(true); child.props.onFocus?.(e) },
      onBlur: (e: React.FocusEvent) => { setVisible(false); child.props.onBlur?.(e) },
    },
  }

  return (
    <>
      {anchor}
      {visible && createPortal(
        <div
          ref={bubbleRef}
          role="tooltip"
          className={`tooltip tooltip--${placement} animate-slide-${placement === 'bottom' ? 'down' : 'up'}`}
          style={{ top: pos.top, left: pos.left }}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  )
}
