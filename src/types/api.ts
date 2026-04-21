export interface ApiChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ApiChatRequest {
  messages: ApiChatMessage[]
}

export interface ApiChatResponse {
  text: string
}

export interface ApiError {
  error: string
}
