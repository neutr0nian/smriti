import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: Number(process.env.PORT ?? 3001),
  provider: (process.env.LLM_PROVIDER ?? 'mock') as 'mock' | 'ollama',
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL ?? 'llama3.2',
  },
} as const
