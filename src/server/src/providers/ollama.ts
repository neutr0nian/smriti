import { Ollama } from 'ollama'
import type { ILLMProvider } from './base'
import type { ChatRequest, ChatResponse } from '../types/chat'
import { config } from '../config'

const client = new Ollama({ host: config.ollama.baseUrl })

export class OllamaProvider implements ILLMProvider {
  constructor(private readonly model: string) {}

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await client.chat({
      model: this.model,
      messages: request.messages.map(m => ({ role: m.role, content: m.content })),
      think: false,
      stream: false,
      options: { temperature: 0.7 },
    })
    return { text: response.message.content }
  }

  async *stream(request: ChatRequest): AsyncGenerator<string> {
    const response = await client.chat({
      model: this.model,
      messages: request.messages.map(m => ({ role: m.role, content: m.content })),
      think: false,
      stream: true,
      options: { temperature: 0.7 },
    })

    for await (const chunk of response) {
      if (chunk.message.content) {
        yield chunk.message.content
      }
    }
  }
}
