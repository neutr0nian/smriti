import { Router } from 'express'
import type { Request, Response } from 'express'
import { createProvider } from '../providers'
import type { ChatMessage } from '../types/chat'

const router = Router()
const provider = createProvider()

router.post('/', async (req: Request, res: Response) => {
  const { messages } = req.body as { messages: ChatMessage[] }

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages required' })
    return
  }

  const prompt: ChatMessage[] = [
    {
      role: 'system',
      content: 'You generate short titles for study conversations. Reply with only the title — 3 to 5 words, no quotes, no trailing punctuation.',
    },
    ...messages,
    {
      role: 'user',
      content: 'Generate a title for this conversation.',
    },
  ]

  try {
    const response = await provider.chat({ messages: prompt })
    res.json({ title: response.text.trim() })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed'
    res.status(500).json({ error: message })
  }
})

export default router
