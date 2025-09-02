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

export function useMercure({
  topic,
  mercureUrl,
}: MercureHookOptions) {
  const [messages, setMessages] = useState<MercureMessage[]>([])
  const [lastMessage, setLastMessage] = useState<MercureMessage | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const url = new URL(mercureUrl || process.env.NEXT_PUBLIC_MERCURE_URL || "/.well-known/mercure", window.location.origin)
    url.searchParams.append("topic", topic)

    const eventSource = new EventSource(url.toString())

    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        const message: MercureMessage = {
          id: event.lastEventId || Date.now().toString(),
          type: event.type || "message",
          data: data,
        }

        setMessages((prev) => [...prev, message])
        setLastMessage(message)
      } catch (err) {
        console.error("Error parsing Mercure message:", err)
        setError("Error parsing message")
      }
    }

    eventSource.onerror = (event) => {
      setIsConnected(false)
      setError("Connection error")
      console.error("Mercure connection error:", event)
    }

    return () => {
      eventSource.close()
      setIsConnected(false)
    }
  }, [topic, mercureUrl])

  return {
    messages,
    lastMessage,
    isConnected,
    error,
  }
}
