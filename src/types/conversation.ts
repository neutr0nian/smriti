export interface TextBlock {
  kind: 'text'
  content: string
}

export interface SketchBlock {
  kind: 'sketch'
  code: string
  title: string
  width: number
  height: number
}

export type MessageBlock = TextBlock | SketchBlock

export function blocksToText(blocks: MessageBlock[]): string {
  return blocks
    .filter((b): b is TextBlock => b.kind === 'text')
    .map(b => b.content)
    .join('')
}

export interface MessageData {
  id: string
  role: 'user' | 'assistant'
  blocks: MessageBlock[]
  versions?: MessageBlock[][]
  versionIndex?: number
}

export interface InlineNote {
  id: string
  messageId: string
  text: string
}

export interface ConversationMeta {
  id: string
  title: string
  subtitle: string
}

export interface ConversationData extends ConversationMeta {
  messages: MessageData[]
  inlineNotes: InlineNote[]
}
