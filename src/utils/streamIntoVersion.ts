import type { MessageData } from '@/types/conversation'
import type { ApiChatMessage, ApiChatRequest } from '@/types/api'

type StreamFn = (body: ApiChatRequest, onChunk: (chunk: string) => void) => Promise<void>
type SetMessages = React.Dispatch<React.SetStateAction<MessageData[]>>

interface StreamIntoVersionOptions {
  id: string
  versionIndex: number
  history: ApiChatMessage[]
  streamChat: StreamFn
  setMessages: SetMessages
  messagesRef: React.MutableRefObject<MessageData[]>
}

export async function streamIntoVersion({
  id, versionIndex, history, streamChat, setMessages, messagesRef,
}: StreamIntoVersionOptions) {
  let streamedText = ''
  await streamChat(
    { messages: history },
    (chunk) => {
      streamedText += chunk
      setMessages((ms) =>
        ms.map((m) => {
          if (m.id !== id) return m
          const versions = [...(m.versions ?? [])]
          versions[versionIndex] = streamedText
          return { ...m, text: streamedText, versions }
        }),
      )
    },
  )
  messagesRef.current = messagesRef.current.map((m) => {
    if (m.id !== id) return m
    const versions = [...(m.versions ?? [])]
    versions[versionIndex] = streamedText
    return { ...m, text: streamedText, versions }
  })
}
