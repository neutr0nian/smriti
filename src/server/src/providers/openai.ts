import OpenAI from 'openai'
import type { ILLMProvider } from './base'
import type { AgentEvent, ChatMessage, ChatRequest, ChatResponse, Tool } from '../types/chat'
import { SKETCH_BOUNDS } from '../types/chat'

interface SketchArgs {
  code: string
  title: string
  width: number
  height: number
}

const isSketchArgs = (args: unknown): args is SketchArgs => {
  if (typeof args !== 'object' || args === null) return false
  const a = args as SketchArgs
  return typeof a.code === 'string' && typeof a.title === 'string'
    && typeof a.width === 'number' && typeof a.height === 'number'
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

// gpt-4o-mini occasionally double-escapes whitespace inside tool-call argument
// strings, so JSON.parse yields literal `\n` instead of real newlines.
// Detect that pattern and normalize it back.
const decodeOverEscapedString = (s: string): string =>
  /\\n|\\t|\\r/.test(s)
    ? s.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '\r')
    : s

const toOpenAIMessages = (messages: ChatMessage[]): OpenAI.Chat.ChatCompletionMessageParam[] =>
  messages.map(m => ({ role: m.role, content: m.content }))

const toOpenAITools = (tools: Tool[]): OpenAI.Chat.ChatCompletionTool[] =>
  tools.map(t => ({ type: 'function', function: t.function }))

interface OpenAIProviderConfig {
  apiKey: string
  model: string
  temperature?: number
}

export const createOpenAIProvider = ({
  apiKey, model, temperature = 0.7,
}: OpenAIProviderConfig): ILLMProvider => {
  const client = new OpenAI({ apiKey })

  const chat = async (request: ChatRequest): Promise<ChatResponse> => {
    const completion = await client.chat.completions.create({
      model,
      temperature,
      messages: toOpenAIMessages(request.messages),
    })
    return { text: completion.choices[0]?.message.content ?? '' }
  }

  async function* stream(request: ChatRequest): AsyncGenerator<string> {
    const response = await client.chat.completions.create({
      model,
      temperature,
      stream: true,
      messages: toOpenAIMessages(request.messages),
    })
    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta.content
      if (content) yield content
    }
  }

  async function* streamWithTools(request: ChatRequest, tools: Tool[]): AsyncGenerator<AgentEvent> {
    const messages = toOpenAIMessages(request.messages)
    const openaiTools = toOpenAITools(tools)

    const round1 = await client.chat.completions.create({
      model,
      temperature,
      tools: openaiTools,
      messages,
    })

    const round1Message = round1.choices[0]?.message
    if (!round1Message) return

    const toolCalls = round1Message.tool_calls
    if (!toolCalls?.length) {
      if (round1Message.content) yield { type: 'text', chunk: round1Message.content }
      return
    }

    messages.push(round1Message)

    for (const call of toolCalls) {
      if (call.type !== 'function') continue
      let args: unknown
      try { args = JSON.parse(call.function.arguments) } catch { continue }
      if (call.function.name === 'render_p5_sketch' && isSketchArgs(args)) {
        const code = decodeOverEscapedString(args.code)
        const width = clamp(Math.round(args.width), SKETCH_BOUNDS.width.min, SKETCH_BOUNDS.width.max)
        const height = clamp(Math.round(args.height), SKETCH_BOUNDS.height.min, SKETCH_BOUNDS.height.max)
        yield { type: 'sketch', code, title: args.title, width, height }
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: `Sketch "${args.title}" rendered inline.`,
        })
      }
    }

    const round2 = await client.chat.completions.create({
      model,
      temperature,
      stream: true,
      messages,
    })

    for await (const chunk of round2) {
      const content = chunk.choices[0]?.delta.content
      if (content) yield { type: 'text', chunk: content }
    }
  }

  return { chat, stream, streamWithTools }
}
