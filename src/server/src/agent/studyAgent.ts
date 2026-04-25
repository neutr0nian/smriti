import type { AgentEvent, ChatMessage, ChatRequest, ChatResponse, Tool } from '../types/chat'
import { SKETCH_BOUNDS } from '../types/chat'
import { createProvider } from '../providers'
import { SYSTEM_PROMPT } from './systemPrompt'

const TOOLS: Tool[] = [
  {
    type: 'function',
    function: {
      name: 'render_p5_sketch',
      description: 'Render a static 2D p5.js diagram inline in the conversation. Use when a labeled illustration or visual layout would help explain a concept. Do not use for animations or interactive sketches.',
      parameters: {
        type: 'object',
        properties: {
          width: {
            type: 'integer',
            minimum: SKETCH_BOUNDS.width.min,
            maximum: SKETCH_BOUNDS.width.max,
            description: `Canvas width in pixels (${SKETCH_BOUNDS.width.min}–${SKETCH_BOUNDS.width.max}). Must match the first argument of createCanvas in the code.`,
          },
          height: {
            type: 'integer',
            minimum: SKETCH_BOUNDS.height.min,
            maximum: SKETCH_BOUNDS.height.max,
            description: `Canvas height in pixels (${SKETCH_BOUNDS.height.min}–${SKETCH_BOUNDS.height.max}). Must match the second argument of createCanvas in the code.`,
          },
          code: {
            type: 'string',
            description: `Drawing code for a static 2D p5.js diagram. JavaScript only. Hard rules:
- Write drawing code only. Do NOT define setup(), draw(), or call createCanvas — those are provided. Your code runs once after the canvas is created and quality defaults are applied (smoothing, sharp 2× rendering, 2px strokes, sans-serif 14pt centered text).
- Declare every variable with let or const before use. No undeclared identifiers. Comments use //, never #.
- Use the PALETTE global for all fills and strokes. Stay on-palette so diagrams feel cohesive:
    PALETTE.text    (#2D2A25, dark warm — labels, important text)
    PALETTE.primary (#4A4540, warm dark — main shapes, structural lines)
    PALETTE.muted   (#8A8578, warm gray — secondary elements, dimmed text)
    PALETTE.accent  (#D97757, orange — highlights, the "look here" element)
    PALETTE.soft    (#F3EFE5, cream — light backdrops behind boxes, never as foreground)
- Use the PAD global (24) for margins from canvas edges. Lay things out so nothing touches the edge.
- The p5 globals width and height refer to the canvas size — use them for layout math.
- Do NOT call background() — the canvas is transparent so the message bubble shows through.
- No animation, no input handlers. Communicate everything in this single pass.
- Keep code under 60 lines. No backticks or markdown fences.

Example (with width=400, height=200):
const bars = [40, 80, 120, 60, 100];
const slot = (width - PAD * 2) / bars.length;
const barW = slot - 8;
for (let i = 0; i < bars.length; i++) {
  const x = PAD + i * slot;
  const h = bars[i];
  noStroke();
  fill(PALETTE.primary);
  rect(x, height - PAD - h, barW, h);
  fill(PALETTE.text);
  text(bars[i], x + barW / 2, height - PAD - h - 12);
}`,
          },
          title: {
            type: 'string',
            description: 'Short title for the sketch (e.g. "Sine Wave", "Binary Tree Traversal").',
          },
        },
        required: ['width', 'height', 'code', 'title'],
      },
    },
  },
]

const provider = createProvider()

export async function runStudyAgent(messages: ChatMessage[]): Promise<ChatResponse> {
  const request: ChatRequest = { messages: [SYSTEM_PROMPT, ...messages] }
  return provider.chat(request)
}

export async function* streamStudyAgent(messages: ChatMessage[]): AsyncGenerator<AgentEvent> {
  const request: ChatRequest = { messages: [SYSTEM_PROMPT, ...messages] }

  if (provider.streamWithTools) {
    yield* provider.streamWithTools(request, TOOLS)
    return
  }

  for await (const chunk of provider.stream(request)) {
    yield { type: 'text', chunk }
  }
}
