import type { ChatRequest, ChatResponse } from '../types/chat'

export interface ILLMProvider {
  chat(request: ChatRequest): Promise<ChatResponse>
  stream(request: ChatRequest): AsyncGenerator<string>
}

export type ProviderName = 'mock' | 'ollama'

export interface ProviderConfig {
  provider: ProviderName
}
