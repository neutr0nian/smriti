import type { ChatRequest, ChatResponse, Tool, AgentEvent } from '../types/chat'

export interface ILLMProvider {
  chat(request: ChatRequest): Promise<ChatResponse>
  stream(request: ChatRequest): AsyncGenerator<string>
  streamWithTools?(request: ChatRequest, tools: Tool[]): AsyncGenerator<AgentEvent>
}

export type ProviderName = 'mock' | 'openai'

export interface ProviderConfig {
  provider: ProviderName
}
