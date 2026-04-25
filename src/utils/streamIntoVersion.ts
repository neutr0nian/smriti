import type { MessageData, MessageBlock, TextBlock } from '@/types/conversation'
import type { ApiChatMessage, ApiChatRequest } from '@/types/api'
import type { StreamEvent } from '@/hooks/useStreamPost'

type StreamFn = (body: ApiChatRequest, onEvent: (event: StreamEvent) => void) => Promise<void>
type SetMessages = React.Dispatch<React.SetStateAction<MessageData[]>>

interface StreamIntoVersionOptions {
  id: string
  versionIndex: number
  history: ApiChatMessage[]
  streamChat: StreamFn
  setMessages: SetMessages
  messagesRef: React.MutableRefObject<MessageData[]>
}

function appendTextChunk(blocks: MessageBlock[], chunk: string): MessageBlock[] {
  const last = blocks[blocks.length - 1]
  if (last?.kind === 'text') {
    const updated: TextBlock = { kind: 'text', content: last.content + chunk }
    return [...blocks.slice(0, -1), updated]
  }
  return [...blocks, { kind: 'text', content: chunk }]
}

function updateVersion(messages: MessageData[], id: string, versionIndex: number, blocks: MessageBlock[]): MessageData[] {
  return messages.map((m) => {
    if (m.id !== id) return m
    const versions = [...(m.versions ?? [])]
    versions[versionIndex] = blocks
    return { ...m, blocks, versions }
  })
}

export async function streamIntoVersion({
  id, versionIndex, history, streamChat, setMessages, messagesRef,
}: StreamIntoVersionOptions) {
  let currentBlocks: MessageBlock[] = []

  await streamChat(
    { messages: history },
    (event) => {
      if (event.type === 'text') {
        currentBlocks = appendTextChunk(currentBlocks, event.chunk)
      } else {
        currentBlocks = [...currentBlocks, {
          kind: 'sketch',
          code: event.code,
          title: event.title,
          width: event.width,
          height: event.height,
        }]
      }
      setMessages((ms) => updateVersion(ms, id, versionIndex, currentBlocks))
    },
  )

  messagesRef.current = updateVersion(messagesRef.current, id, versionIndex, currentBlocks)
}
