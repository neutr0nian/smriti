export type MessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  role: MessageRole
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
}

export interface ChatResponse {
  text: string
}

export const SKETCH_BOUNDS = {
  width: { min: 300, max: 700 },
  height: { min: 200, max: 500 },
} as const

export interface SketchEvent {
  type: 'sketch'
  code: string
  title: string
  width: number
  height: number
}

export interface Tool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export type AgentEvent =
  | { type: 'text'; chunk: string }
  | SketchEvent
