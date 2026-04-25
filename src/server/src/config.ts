import dotenv from 'dotenv'
import type { ProviderName } from './providers/base'

dotenv.config()

const VALID_PROVIDERS: ProviderName[] = ['mock', 'openai']

const parseProvider = (raw: string | undefined): ProviderName => {
  const value = raw ?? 'mock'
  if (!VALID_PROVIDERS.includes(value as ProviderName)) {
    throw new Error(`Invalid LLM_PROVIDER "${value}". Expected one of: ${VALID_PROVIDERS.join(', ')}`)
  }
  return value as ProviderName
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  provider: parseProvider(process.env.LLM_PROVIDER),
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
  },
} as const
