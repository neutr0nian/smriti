import { useState, useCallback } from 'react'

interface UsePostState<TData> {
  data: TData | null
  error: string | null
  loading: boolean
}

interface UsePostReturn<TData, TBody> extends UsePostState<TData> {
  execute: (body: TBody) => Promise<TData | null>
  reset: () => void
}

export function usePost<TData, TBody>(url: string): UsePostReturn<TData, TBody> {
  const [state, setState] = useState<UsePostState<TData>>({
    data: null,
    error: null,
    loading: false,
  })

  const execute = useCallback(async (body: TBody): Promise<TData | null> => {
    setState({ data: null, error: null, loading: true })

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => null)
        const message = json?.error ?? `Request failed: ${res.status} ${res.statusText}`
        throw new Error(message)
      }

      const data: TData = await res.json()
      setState({ data, error: null, loading: false })
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setState({ data: null, error: message, loading: false })
      return null
    }
  }, [url])

  const reset = useCallback(() => {
    setState({ data: null, error: null, loading: false })
  }, [])

  return { ...state, execute, reset }
}
