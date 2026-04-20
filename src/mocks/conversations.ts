import type { ConversationMeta, ConversationData } from '@/types/conversation'
import type { FloatingNote } from '@/types/notes'

export const MOCK_CONVERSATION_LIST: ConversationMeta[] = [
  { id: 'conv-1', title: 'Light-dependent reactions', subtitle: 'Photosynthesis · Ch. 3' },
  { id: 'conv-2', title: 'Calvin Cycle overview',     subtitle: 'Photosynthesis · Ch. 4' },
  { id: 'conv-3', title: 'Chloroplast Structure',     subtitle: 'Photosynthesis · Ch. 2' },
]

export const MOCK_CONVERSATION_DATA: Record<string, ConversationData> = {
  'conv-1': {
    id: 'conv-1',
    title: 'Light-dependent reactions',
    subtitle: 'Photosynthesis · Ch. 3',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        text: "I'm trying to understand the light-dependent reactions of photosynthesis. Can you walk me through the big picture first?",
      },
      {
        id: 'msg-2',
        role: 'assistant',
        text: "Sure — the light-dependent reactions are the first stage of photosynthesis, and their job is to convert light energy into chemical energy that the second stage (the Calvin cycle) can use.",
      },
      {
        id: 'msg-3',
        role: 'user',
        text: 'What exactly gets produced that the Calvin cycle needs?',
      },
      {
        id: 'msg-4',
        role: 'assistant',
        text: 'Two things: ATP (the energy currency) and NADPH (an electron carrier). Both are produced in the thylakoid membranes and then shipped to the stroma where the Calvin cycle runs.',
      },
    ],
    inlineNotes: [
      { id: 'in-1', messageId: 'msg-2', text: 'Remember: light-dependent = thylakoid, Calvin = stroma' },
    ],
  },

  'conv-2': {
    id: 'conv-2',
    title: 'Calvin Cycle overview',
    subtitle: 'Photosynthesis · Ch. 4',
    messages: [
      {
        id: 'msg-5',
        role: 'user',
        text: "How does the Calvin cycle actually use the ATP and NADPH from the light reactions?",
      },
      {
        id: 'msg-6',
        role: 'assistant',
        text: "The Calvin cycle uses ATP and NADPH to fix CO₂ into G3P — a 3-carbon sugar that's the building block for glucose. It runs in three phases: carbon fixation, reduction, and regeneration of RuBP.",
      },
    ],
    inlineNotes: [],
  },

  'conv-3': {
    id: 'conv-3',
    title: 'Chloroplast Structure',
    subtitle: 'Photosynthesis · Ch. 2',
    messages: [
      {
        id: 'msg-7',
        role: 'user',
        text: "Can you describe the key structural parts of a chloroplast?",
      },
      {
        id: 'msg-8',
        role: 'assistant',
        text: "A chloroplast has two outer membranes enclosing the stroma — a fluid-filled space. Inside the stroma are thylakoids, flattened membrane sacs stacked into grana. The light reactions happen in the thylakoid membranes; the Calvin cycle runs in the stroma.",
      },
    ],
    inlineNotes: [],
  },
}

export const MOCK_FLOATING_NOTES: Record<string, FloatingNote[]> = {
  'conv-1': [
    {
      id: 'fn-1',
      conversationId: 'conv-1',
      kind: 'sticky',
      x: 820,
      y: 120,
      w: 180,
      rot: -1.5,
      text: 'Photosystem II → splits water → O₂ released',
    },
    {
      id: 'fn-2',
      conversationId: 'conv-1',
      kind: 'scribble',
      x: 40,
      y: 300,
      w: 220,
      rot: 1.2,
      text: 'ETC: PSII → PQ → Cyt b6f → PC → PSI',
    },
  ],
  'conv-2': [],
}

// Simulates an async API fetch — swap this for a real fetch() call later
export async function fetchConversation(id: string): Promise<{
  data: ConversationData
  floatingNotes: FloatingNote[]
} | null> {
  await new Promise(r => setTimeout(r, 300))
  const data = MOCK_CONVERSATION_DATA[id]
  if (!data) return null
  return {
    data,
    floatingNotes: MOCK_FLOATING_NOTES[id] ?? [],
  }
}
