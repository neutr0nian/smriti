export interface FloatingNote {
  id: string
  kind: 'sticky' | 'scribble'
  x: number
  y: number
  w: number
  text: string
  rot: number
}
