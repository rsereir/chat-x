import { SendOutlined } from "@ant-design/icons"
import { Empty } from "antd"
import { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import Message from "@/components/message"
import Button from "@/components/ui/button"
import Card from "@/components/ui/card"
import Input from "@/components/ui/input"
import { useRoom } from "@/contexts/RoomContext"
import { useAuth } from "@/hooks/useAuth"
import { useMercure } from "@/hooks/useMercure"
import { api } from "@/utils/api"

export default function Chat() {
  const { user } = useAuth()
  const { currentRoom, currentRoomId } = useRoom()
  const [composer, setComposer] = useState("")
  const [isLoading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const { data: messagesData, mutate } = useSWR(
    currentRoomId ? `/messages?room=${currentRoomId}` : null,
    (url: string) => api.get<{ data: ChatMessage[] }>(url),
  )

  const { lastMessage } = useMercure({
    topic: "/api/messages",
  })

  const messages = messagesData?.data || []

  useEffect(() => {
    if (lastMessage?.data && currentRoomId) {
      const newMessage = lastMessage.data as ChatMessage
      if (newMessage.room.id === currentRoomId) {
        mutate()
      }
    }
  }, [lastMessage, currentRoomId, mutate])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <for scroll>
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  const handleSendMessage = async () => {
    if (!composer.trim() || !currentRoomId || !user || isLoading) {
      return
    }

    setLoading(true)
    try {
      await api.post("/messages", {
        content: composer.trim(),
        room: `/rooms/${currentRoomId}`,
        author: `/accounts/${user?.id}`,
      })

      setComposer("")
      mutate()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "1fr auto",
        height: "calc(100vh - 64px)",
      }}
    >
      <div style={{ padding: 16, overflow: "hidden" }}>
        <Card
          size="small"
          title={currentRoom ? `#${currentRoom?.name}` : "Welcome"}
          className="glass glass-strong"
          style={{ height: "100%" }}
          styles={{
            body: {
              height: "100%",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              background: "transparent",
            },
          }}
        >
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 16,
              background: "transparent",
            }}
          >
            {!currentRoom ? (
              <div
                style={{
                  height: "100%",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Empty description="Choose or create a channel to start" />
              </div>
            ) : messages.length === 0 ? (
              <div
                style={{
                  height: "100%",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Empty
                  description="No messages"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {messages.map((m) => (
                  <Message
                    key={m.id}
                    message={{
                      id: m.id,
                      room: currentRoom,
                      author: m.author,
                      content: m.content,
                      at: new Date(m.createdAt).getTime(),
                    }}
                    isMine={m.author.username === user?.username}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <div
        style={{
          padding: 16,
          borderTop: "1px solid rgba(15,23,42,0.06)",
          background: "transparent",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 8,
            alignItems: "stretch",
          }}
        >
          <Input.TextArea
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder={
              currentRoom ? "Your message..." : "Join a channel to write"
            }
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={!currentRoom || !user?.username?.trim() || isLoading}
            style={{ resize: "none" }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={isLoading}
            disabled={
              !composer.trim() || !currentRoom || !user?.username?.trim()
            }
            style={{ height: "100%", alignSelf: "stretch" }}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
