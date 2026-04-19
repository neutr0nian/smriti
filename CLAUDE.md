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
