import type { ILLMProvider } from './base'
import type { ChatRequest } from '../types/chat'

const MOCK_RESPONSES = [
  "The light-dependent reactions occur in the thylakoid membranes. When light hits Photosystem II, it excites electrons which travel down the electron transport chain, pumping protons and generating ATP and NADPH.",
  "The Calvin cycle runs in the stroma and uses the ATP and NADPH from the light reactions to fix CO₂ into G3P — a 3-carbon sugar that becomes the building block for glucose.",
  "Chloroplasts have two outer membranes surrounding the stroma. Inside the stroma, thylakoids are stacked into grana. This compartmentalization separates the two stages of photosynthesis.",
  "ATP synthase is a molecular motor embedded in the thylakoid membrane. The flow of protons through it — down the concentration gradient — drives the synthesis of ATP from ADP and phosphate.",
]

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const pickResponse = (request: ChatRequest): string => {
  const last = request.messages.at(-1)
  const index = last ? Math.abs(last.content.length) % MOCK_RESPONSES.length : 0
  return MOCK_RESPONSES[index]
}

export const createMockProvider = (): ILLMProvider => ({
  chat: async (request) => {
    await delay(800)
    return { text: pickResponse(request) }
  },
  stream: async function* (request) {
    const words = pickResponse(request).split(' ')
    for (const word of words) {
      await delay(60)
      yield word + ' '
    }
  },
})
