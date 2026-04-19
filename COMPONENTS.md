# Claude-Book · Component Reference

## Conversation
| # | Component | Description |
|---|-----------|-------------|
| 1 | `ConversationTitle` | Chapter label + h1 heading at the top of the page |
| 2 | `UserMessage` | "YOU" label + question text |
| 3 | `AssistantMessage` | "ASSISTANT" label + one or more paragraphs |
| 4 | `InlineNote` | Text block that flows between messages (accent left-rule, "NOTE" label) |

## Inline Affordance
| # | Component | Description |
|---|-----------|-------------|
| 5 | `GapPlus` | `+` button revealed on hover between messages — inserts an `InlineNote` |

## Floating Notes
| # | Component | Description |
|---|-----------|-------------|
| 6  | `NoteToolbar` | Popover with T / sticky / margin / heading / checklist buttons |
| 7  | `TextNote` | Plain text block, accent left border, draggable |
| 8  | `StickyNote` | Yellow rotated sticky, Caveat font, draggable |
| 9  | `MarginNote` | Handwritten-style scribble, no background, draggable |
| 10 | `HeadingNote` | Serif heading with bottom border, draggable |
| 11 | `ChecklistNote` | Checklist with check/uncheck items, draggable |

## Selection
| # | Component | Description |
|---|-----------|-------------|
| 12 | `HighlightPill` | "→ pin as margin note" button that appears on text selection |

## Layout / Chrome
| # | Component | Description |
|---|-----------|-------------|
| 13 | `Topbar` | Notebook title, breadcrumb, note count, clear button, search, page number |
| 14 | `TextInput` | Docked bottom bar with send button |
| 15 | `NotebookPage` | Paper surface with red margin rule, hosts all layers, page number footer |

## Build Order (suggested)
1. Layout shell — `NotebookPage` → `Topbar` → `TextInput`
2. Conversation — `ConversationTitle` → `UserMessage` → `AssistantMessage`
3. Inline notes — `GapPlus` → `InlineNote`
4. Floating notes — `NoteToolbar` → `TextNote` → `StickyNote` → `MarginNote` → `HeadingNote` → `ChecklistNote`
5. Selection — `HighlightPill`
