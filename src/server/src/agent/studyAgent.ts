import type { ILLMProvider } from '../providers/base'
import type { ChatMessage, ChatRequest, ChatResponse } from '../types/chat'
import { MockProvider } from '../providers/mock'
import { OllamaProvider } from '../providers/ollama'
import { config } from '../config'

const SYSTEM_PROMPT: ChatMessage = {
  role: 'system',
  content: `You are a study assistant helping students understand complex concepts clearly and accurately.
- Give concise, well-structured explanations
- Use analogies where helpful
- Build on what the student already knows from the conversation
- Ask a follow-up question occasionally to check understanding`,
}

function createProvider(): ILLMProvider {
  switch (config.provider) {
    case 'mock':
      return new MockProvider()
    case 'ollama':
      return new OllamaProvider(config.ollama.model)
  }
}

const provider = createProvider()

export async function runStudyAgent(messages: ChatMessage[]): Promise<ChatResponse> {
  const request: ChatRequest = { messages: [SYSTEM_PROMPT, ...messages] }
  return provider.chat(request)
}

export async function* streamStudyAgent(messages: ChatMessage[]): AsyncGenerator<string> {
  const request: ChatRequest = { messages: [SYSTEM_PROMPT, ...messages] }
  yield* provider.stream(request)
}
