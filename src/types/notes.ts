export interface FloatingNote {
  id: string
  conversationId: string
  kind: 'sticky' | 'scribble'
  x: number
  y: number
  w: number
  h?: number
  rot: number
  text: string
}
