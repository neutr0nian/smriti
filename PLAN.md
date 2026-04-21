# ClaudeBook — Study Agent

## What We're Building

A notebook-style study agent UI where a user can have a conversation with Claude, annotate responses, and the agent can draw diagrams/visualizations inline using P5.js. The goal is a rich study environment — not just chat.

## Where We Are

### Done
- Notebook UI (paper aesthetic, margin rule, tokens/design system)
- Conversation thread with streaming LLM responses (`localhost:3001`)
- Message versioning — edit/retry generates new versions, navigable via toolbar carousel
- Contextual message toolbar (edit, retry, add note, version nav)
- Inline notes attached to messages
- Floating sticky notes and scribble annotations on the notebook page

### In Progress / Cleanup
- Code quality pass (streaming util, dead CSS, removed user retry)

## Next Steps

### 1. P5.js Integration via MCP
Allow the agent to draw diagrams, visualizations, and sketches inline in the conversation.
- Set up an MCP server that exposes P5.js as a tool
- Agent calls the tool with a sketch description or code
- Output renders as an embedded P5 canvas inside the assistant message

### 2. Agent Framework — Mastra (evaluate if necessary)
Mastra is a TypeScript-native agent framework. Relevant if we need:
- Multi-step reasoning / tool orchestration beyond single LLM calls
- Memory and context management across sessions
- Built-in tool/MCP wiring

**Decision point:** If the P5.js MCP integration stays simple (single tool call per message), Mastra may be overkill. Revisit after step 1.
