import { useState, useCallback } from 'react'

interface UseStreamPostState {
  streaming: boolean
  error: string | null
}

interface UseStreamPostReturn extends UseStreamPostState {
  execute: <TBody>(body: TBody, onChunk: (text: string) => void) => Promise<void>
}

export function useStreamPost(url: string): UseStreamPostReturn {
  const [state, setState] = useState<UseStreamPostState>({
    streaming: false,
    error: null,
  })

  const execute = useCallback(async <TBody>(
    body: TBody,
    onChunk: (text: string) => void,
  ): Promise<void> => {
    setState({ streaming: true, error: null })

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok || !res.body) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error ?? `Request failed: ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') return
          try {
            const parsed = JSON.parse(data) as { text?: string; error?: string }
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.text) onChunk(parsed.text)
          } catch (e) {
            if (e instanceof SyntaxError) continue
            throw e
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Stream error'
      setState(s => ({ ...s, error: message }))
    } finally {
      setState(s => ({ ...s, streaming: false }))
    }
  }, [url])

  return { ...state, execute }
}
