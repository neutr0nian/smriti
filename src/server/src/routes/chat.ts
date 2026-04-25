import { Router } from 'express'
import type { Request, Response } from 'express'
import { streamStudyAgent } from '../agent/studyAgent'
import type { ChatRequest } from '../types/chat'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
  const { messages } = req.body as ChatRequest

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages must be a non-empty array' })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    for await (const event of streamStudyAgent(messages)) {
      if (event.type === 'text') {
        res.write(`data: ${JSON.stringify({ text: event.chunk })}\n\n`)
      } else {
        res.write(`data: ${JSON.stringify(event)}\n\n`)
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stream error'
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`)
  } finally {
    res.write('data: [DONE]\n\n')
    res.end()
  }
})

export default router
