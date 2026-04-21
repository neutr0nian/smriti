# Claude-Book · Project Rules

## File Naming
- Component files: PascalCase — `ConversationTitle.tsx`
- CSS module files: kebab-case — `conversation-title.module.css`
- All other files (hooks, utils, types): camelCase — `useNotes.ts`

## Styling
- Use plain `.css` files (not CSS Modules) paired with each component
- Class names follow BEM — `block`, `block__element`, `block--modifier`
- The block name matches the component's kebab-case file name — e.g. `NotebookPage` → `notebook-page`
- Import CSS directly in the component file: `import './notebook-page.css'`
- Use class names directly: `className="notebook-page__topbar"` — never `styles.topbar`
- CSS classes reference tokens via CSS custom properties — `var(--token-name)`, never raw values
- TS token files (`src/tokens/`) are for JS logic only; do not import tokens into component styles
- No inline styles in components unless the value is truly dynamic (e.g. computed at runtime)

## Tokens
- All design tokens are defined in `src/tokens/` (TS) and mirrored in `src/styles/tokens.css` (CSS vars)
- When adding a new token, update both files

## Component Structure
- One component per file
- Each component lives alongside its CSS module in the same folder
- Group by concern under `src/components/` — e.g. `layout/`, `conversation/`, `notes/`

## TypeScript
- No `any`
- Prefer `interface` over `type` for component props
- All props interfaces named `<ComponentName>Props`
- Use named object params (not positional) when a function takes 3+ arguments — easier to read and extend
- Guard against impossible states at the boundary, not defensively throughout internal logic

## CSS Quality
- Never combine `cursor: not-allowed` with `pointer-events: none` — they conflict; `pointer-events: none` wins and the cursor rule is dead
- Avoid layout-shifting hover effects (e.g. adding padding on hover) — use `box-shadow` or `outline` for lift/focus effects that don't shift layout
- Always use `transition` (not `animation`) for hover state changes like shadow or color
- Use design system tokens for all durations and easings — `var(--duration-slow)`, `var(--ease-enter)` etc.
- A `box-shadow` token is a complete value — use it directly: `box-shadow: var(--shadow-paper)`, never wrap it as a color argument

## Code Modularity
- Extract repeated async patterns into a util — e.g. streaming logic shared across 3+ call sites belongs in `src/utils/`
- Utils live in `src/utils/`, typed against the project's own types (not generic)
- Duplicate logic across branches (e.g. same computation in if/else) should be hoisted before the branch

## Comments
- No comments that describe WHAT the code does — well-named identifiers do that
- Only comment when the WHY is non-obvious: a hidden constraint, a pattern name, a workaround
- Acceptable: `// Find the next assistant message (N+1) to append a new version to`
- Not acceptable: `// Update the edited user message text`

## React Patterns
- Use `useRef` to track previous values when you need to detect direction of change (e.g. version index slide direction)
- Dual-write pattern (`setMessages` + `messagesRef.current`) is intentional here — `messagesRef` exists because streaming callbacks close over stale state
- `key` prop on animated elements forces re-mount and re-triggers animation on value change — use deliberately
