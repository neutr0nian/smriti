export interface MessageData {
  id: string
  role: 'user' | 'assistant'
  text: string
  versions?: string[]
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
