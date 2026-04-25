# Agent Design — P5.js Visualization

## Context

- LLM: Ollama (via `ollama` npm client)
- Backend: Express, SSE streaming at `/api/chat`
- Frontend: React, consumes SSE, renders messages

Ollama supports tool use natively via the `tools` param. Not MCP — just the Ollama chat API's built-in function calling. Models that support it: `qwen2.5`, `llama3.1`, `mistral`, `gemma3`.

---

## Tool Definition

One tool for now:

```ts
{
  type: 'function',
  function: {
    name: 'render_p5_sketch',
    description: 'Render a p5.js visualization inline in the conversation. Use when a diagram, animation, or visual would help explain a concept.',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Complete p5.js sketch — must include setup() and draw() functions'
        },
        title: {
          type: 'string',
          description: 'Short title for the sketch (e.g. "Sine Wave", "Sorting Visualization")'
        }
      },
      required: ['code', 'title']
    }
  }
}
```

The tool has **no server-side side effect** — it just signals the frontend to render. The backend captures the args and forwards them as an SSE event.

---

## Agent Loop

Current `streamStudyAgent` is a single-shot stream. It needs to become an agentic loop:

```
Round 1 — Tool detection (stream: false)
  Send: system + conversation messages + tool definitions
  Receive: either a text response OR a tool_call

  If tool_call → render_p5_sketch:
    1. Emit `sketch` SSE event to frontend (code + title)
    2. Append tool result message to history
    3. Go to Round 2

  If text response:
    Stream text directly (skip Round 2)

Round 2 — Final response (stream: true)
  Send: updated history including tool call + tool result
  Stream text chunks to frontend as normal
```

Why `stream: false` in Round 1: Ollama emits `tool_calls` only in the final message object. Streaming Round 1 would require accumulating all chunks to detect tool calls anyway — non-streaming is simpler and the latency hit is negligible (tool call decisions are short).

---

## SSE Protocol (updated)

Current protocol only has text chunks. New protocol adds a second event type:

```ts
// text chunk (no change to key, stays backward-compatible)
data: { text: string }

// p5.js sketch block
data: { type: 'sketch', code: string, title: string }

// stream end (no change)
data: [DONE]
```

---

## Data Model Changes

Messages currently store `text: string`. A message now needs to hold mixed content — text and sketch blocks interleaved.

```ts
// New block types
type TextBlock = { kind: 'text'; content: string }
type SketchBlock = { kind: 'sketch'; code: string; title: string }
type MessageBlock = TextBlock | SketchBlock

// MessageData (updated)
interface MessageData {
  id: string
  role: 'user' | 'assistant'
  blocks: MessageBlock[]        // replaces `text`
  versions: MessageBlock[][]    // replaces `versions: string[]`
  notes: NoteData[]
}
```

`streamIntoVersion` needs to handle both block types. Text chunks append to the last `TextBlock`; sketch events push a new `SketchBlock`.

---

## New Components

### `P5Sketch`

Renders a p5.js sketch in a sandboxed iframe.

```
src/components/conversation/P5Sketch.tsx
src/components/conversation/p5-sketch.css
```

```tsx
// srcdoc approach — no external URL needed
const srcdoc = `
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js"></script>
  <script>${code}</script>
`
<iframe
  sandbox="allow-scripts"
  srcdoc={srcdoc}
  title={title}
/>
```

`sandbox="allow-scripts"` without `allow-same-origin` gives the sketch a null origin — it can run JS but cannot access parent page DOM, cookies, or localStorage.

---

## File Change Map

| File | Change |
|------|--------|
| `server/src/agent/studyAgent.ts` | Add agentic loop, tool definitions, sketch SSE event |
| `server/src/types/chat.ts` | Add `SketchEvent` to SSE event union |
| `src/types/conversation.ts` | Replace `text: string` with `blocks: MessageBlock[]` |
| `src/utils/streamIntoVersion.ts` | Handle text chunks + sketch events |
| `src/hooks/useConversation.ts` | Pass sketch events through to streamIntoVersion |
| `src/components/conversation/Message.tsx` | Render `blocks` instead of `text` |
| `src/components/conversation/P5Sketch.tsx` | New — iframe sketch renderer |
| `src/components/conversation/p5-sketch.css` | New — sketch container styles |
