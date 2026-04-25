import type { ILLMProvider } from './base'
import { createMockProvider } from './mock'
import { createOpenAIProvider } from './openai'
import { config } from '../config'

export const createProvider = (): ILLMProvider => {
  switch (config.provider) {
    case 'mock':
      return createMockProvider()
    case 'openai':
      return createOpenAIProvider({
        apiKey: config.openai.apiKey,
        model: config.openai.model,
      })
  }
}
