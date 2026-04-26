# rancho

An AI-powered CS study notebook. Ask questions, get explanations with animated diagrams drawn live in the conversation, and annotate your notes with sticky notes and freehand scribbles — all stored locally in your browser.

## ![alt text](<Screenshot 2026-04-25 at 5.41.14 PM.png>)

## Features

### Animated diagrams — the AI draws p5.js illustrations live in the conversation so you can watch concepts take shape

![alt text](<Screenshot 2026-04-25 at 6.38.44 PM.png>)

### Markdown responses — answers render with full formatting: code blocks, lists, headings

### Inline notes - highlight any part of a response and attach a sticky note directly to it

### Sticky notes — drop floating notes anywhere on the page; drag, resize, and rotate them freely

### Freehand scribble — sketch on a transparent canvas overlay to annotate freely

## ![alt text](<Screenshot 2026-04-25 at 5.45.43 PM.png>)

## Tech Stack

**Frontend**

- React 19 + TypeScript
- Vite (bundler)
- PGlite (`@electric-sql/pglite`) — full Postgres running in-browser via IndexedDB
- p5.js — animated diagrams rendered in sandboxed iframes
- react-markdown — message rendering
- Lucide React — icons

**Backend**

- Node.js + Express
- TypeScript with tsx (dev) / compiled JS (prod)
- OpenAI SDK — compatible with any OpenAI-API-compatible provider
- dotenv — environment config

---

## Architecture

```
rancho/
├── src/
│   ├── api/              # Client-side API helpers (conversations, messages, notes)
│   ├── components/
│   │   ├── conversation/ # Message list, input, p5 sketch renderer, toolbar
│   │   ├── home/         # Home page (centered input, greeting)
│   │   ├── layout/       # Sidebar, notebook page shell
│   │   ├── notes/        # Sticky notes, scribble canvas
│   │   └── ...
│   ├── context/          # ConversationContext, SidebarContext
│   ├── db/               # PGlite client + schema migrations
│   ├── hooks/            # useStreamPost (streaming fetch), etc.
│   ├── server/
│   │   └── src/
│   │       ├── agent/    # studyAgent — tool definitions, system prompt
│   │       ├── providers/ # ILLMProvider interface + OpenAI / mock implementations
│   │       ├── routes/   # POST /api/chat (streaming), POST /api/title
│   │       └── config.ts # Env-driven provider selection
│   ├── styles/           # Global CSS, design tokens
│   └── types/            # Shared TypeScript types
```

**Data flow**

1. User sends a message → `POST /api/chat` (SSE stream)
2. Server runs `streamStudyAgent` — calls the LLM with a system prompt and the `render_p5_sketch` tool
3. Text chunks stream back and render as markdown; tool calls render as animated p5.js diagrams inside sandboxed iframes
4. All conversations, messages, and notes are persisted to IndexedDB via PGlite — no backend database required

**Provider pattern**

The server uses an `ILLMProvider` interface (`chat`, `stream`, `streamWithTools`). Swap providers by setting `LLM_PROVIDER` in the server's `.env`. Currently ships with `openai` (default) and `mock`.

---

## Setup

### Prerequisites

- Node.js 20+
- An OpenAI-compatible API key

### 1. Install dependencies

```bash
# Frontend
npm install

# Backend
cd src/server && npm install
```

### 2. Configure the server

Create `src/server/.env`:

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini   # use the best model for better code generation
PORT=3001                   # optional, defaults to 3001
```

### 3. Run

Open two terminals:

```bash
# Terminal 1 — frontend (http://localhost:5173)
npm run dev

# Terminal 2 — backend (http://localhost:3001)
cd src/server && npm run dev
```

The frontend proxies API calls to `localhost:3001`. PGlite initialises automatically in the browser on first load — no database setup needed.

### 4. Build for production

```bash
# Frontend
npm run build

# Backend
cd src/server && npm run build && npm start
```

---

## Contributing

1. Fork the repo and create a feature branch off `main`
2. Follow the code conventions in `CLAUDE.md` — BEM CSS, no inline styles, no `any`, named object params for 3+ args
3. Keep components focused: one component per file, co-located CSS
4. Add or update design tokens in both `src/tokens/` (TS) and `src/styles/tokens.css` when introducing new values
5. Open a pull request with a clear description of what changed and why
