import { useEffect, useState } from "react"

interface MercureHookOptions {
  topic: string
  mercureUrl?: string
}

interface MercureMessage {
  id: string
  type: string
  data: unknown
}

export function useMercure({ topic, mercureUrl }: MercureHookOptions) {
  const [messages, setMessages] = useState<MercureMessage[]>([])
  const [lastMessage, setLastMessage] = useState<MercureMessage | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const base = mercureUrl || process.env.NEXT_PUBLIC_MERCURE_URL || "/.well-known/mercure"
    const origin = typeof window !== "undefined" ? window.location.origin : undefined
    const url = new URL(base, origin)
    url.searchParams.append("topic", topic)

    const eventSource = new EventSource(url.toString())

    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
    }

    eventSource.onmessage = (event) => {
      const parsed = (() => {
        try { return JSON.parse(event.data) } catch { return event.data }
      })()
      const message: MercureMessage = {
        id: event.lastEventId || String(Date.now()),
        type: event.type || "message",
        data: parsed,
      }
      setMessages((prev) => [...prev, message])
      setLastMessage(message)
    }

    eventSource.onerror = () => {
      setIsConnected(false)
      setError("Connection error")
    }

    return () => {
      eventSource.close()
      setIsConnected(false)
    }
  }, [topic, mercureUrl])

  return { messages, lastMessage, isConnected, error }
}
