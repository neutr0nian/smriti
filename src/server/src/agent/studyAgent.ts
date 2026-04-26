import type { AgentEvent, ChatMessage, ChatRequest, ChatResponse, Tool } from '../types/chat'
import { SKETCH_BOUNDS } from '../types/chat'
import { createProvider } from '../providers'
import { SYSTEM_PROMPT } from './systemPrompt'

const TOOLS: Tool[] = [
  {
    type: 'function',
    function: {
      name: 'render_p5_sketch',
      description: 'Render an animated p5.js diagram inline in the conversation. Use when a labeled illustration or visual layout would help explain a concept. Elements should be drawn progressively so the user can witness the diagram being built.',
      parameters: {
        type: 'object',
        properties: {
          width: {
            type: 'integer',
            minimum: SKETCH_BOUNDS.width.min,
            maximum: SKETCH_BOUNDS.width.max,
            description: `Canvas width in pixels (${SKETCH_BOUNDS.width.min}–${SKETCH_BOUNDS.width.max}). Must match the first argument of createCanvas in the code. Size the canvas to fit the content — estimate total horizontal space needed (item widths + gaps + PAD on both sides) and pick accordingly. For wide layouts like linked lists, arrays, or timelines, prefer ${SKETCH_BOUNDS.width.max}px. Never let content touch or clip the edges.`,
          },
          height: {
            type: 'integer',
            minimum: SKETCH_BOUNDS.height.min,
            maximum: SKETCH_BOUNDS.height.max,
            description: `Canvas height in pixels (${SKETCH_BOUNDS.height.min}–${SKETCH_BOUNDS.height.max}). Must match the second argument of createCanvas in the code. Size to fit content with PAD clearance top and bottom — don't leave excessive empty space.`,
          },
          code: {
            type: 'string',
            description: `Drawing code for a p5.js diagram. JavaScript only. Hard rules:
- Write drawing code only. Do NOT define setup(), draw(), or call createCanvas — those are provided.
  Your code runs inside draw() each frame. clear() is called automatically before your code each frame.
  Quality defaults are applied per frame: 1px stroke, PALETTE.text stroke, PALETTE.primary fill, sans-serif 14pt centered text.
- Declare every variable with let or const before use. No undeclared identifiers. Comments use //, never #.
- ANIMATE the drawing: use the p5 global frameCount (starts at 1, increments each frame at 30fps) to reveal elements
  progressively — declare all your data upfront, then show only the first N elements where N = min(frameCount - 1, total).
  Call noLoop() once all elements are visible so the loop stops. For a static diagram with no animation, just call noLoop() as your last line.
- Use the PALETTE global for all fills and strokes:
    PALETTE.text    (#2D2A25) — labels, important text
    PALETTE.primary (#4A4540) — main shapes, structural lines
    PALETTE.muted   (#8A8578) — secondary elements, dimmed text
    PALETTE.accent  (#D97757) — highlights, the "look here" element
    PALETTE.soft    (#F3EFE5) — light backdrops behind boxes, never as foreground
- Use the PAD global (24) for margins. The p5 globals width and height refer to canvas size — use for layout math.
- Do NOT call background() — the canvas is transparent so the message bubble shows through.
- Keep code under 60 lines. No backticks or markdown fences.

Example (animated bar chart, width=400, height=200):
const bars = [40, 80, 120, 60, 100];
const slot = (width - PAD * 2) / bars.length;
const barW = slot - 8;
const visible = min(frameCount - 1, bars.length);
for (let i = 0; i < visible; i++) {
  const x = PAD + i * slot;
  const h = bars[i];
  noStroke(); fill(PALETTE.primary);
  rect(x, height - PAD - h, barW, h);
  fill(PALETTE.text);
  text(bars[i], x + barW / 2, height - PAD - h - 12);
}
if (visible >= bars.length) noLoop();`,
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
