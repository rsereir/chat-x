import { SendOutlined } from "@ant-design/icons"
import { Empty, Form } from "antd"
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
  const [isLoading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const { data: messagesData, mutate } = useSWR(
    currentRoomId ? `/messages?room=${currentRoomId}` : null,
    (url: string) => api.get<{ data: ChatMessage[] }>(url),
  )

  const { lastMessage } = useMercure({
    topic: "/api/messages",
  })

  const messages = (messagesData?.data || []).reverse()

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

  const handleSendMessage = async (values: { content: string }) => {
    if (!values.content?.trim() || !currentRoomId || !user || isLoading) {
      return
    }

    setLoading(true)
    try {
      await api.post("/messages", {
        content: values.content.trim(),
        room: `/rooms/${currentRoomId}`,
        author: `/accounts/${user?.id}`,
      })

      form.resetFields()
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
        maxHeight: "calc(100vh - 64px)",
      }}
    >
      <div style={{ padding: 16, overflow: "hidden", minHeight: 0 }}>
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
              minHeight: 0,
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
                    message={m}
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
        <Form
          form={form}
          onFinish={handleSendMessage}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 8,
            alignItems: "stretch",
          }}
        >
          <Form.Item
            name="content"
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Please enter a message",
              },
            ]}
          >
            <Input.TextArea
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault()
                  form.submit()
                }
              }}
              placeholder={
                currentRoom ? "Your message..." : "Join a channel to write"
              }
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={!currentRoom || !user?.username?.trim() || isLoading}
              style={{ resize: "none" }}
            />
          </Form.Item>
          <Button
            type="primary"
            icon={<SendOutlined />}
            htmlType="submit"
            loading={isLoading}
            disabled={!currentRoom || !user?.username?.trim()}
            style={{ height: "100%", alignSelf: "stretch" }}
          >
            Send
          </Button>
        </Form>
      </div>
    </div>
  )
}
