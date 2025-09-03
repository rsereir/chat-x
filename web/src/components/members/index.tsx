import { CloseOutlined } from "@ant-design/icons"
import { App, Badge, Empty, List, Space, Typography } from "antd"
import Button from "@/components/ui/button"
import Card from "@/components/ui/card"
import Tag from "@/components/ui/tag"
import { useRoom } from "@/contexts/RoomContext"
import { useAuth } from "@/hooks/useAuth"
import { usePresence } from "@/hooks/usePresence"
import { api } from "@/utils/api"

const { Text } = Typography

export default function Members() {
  const { user } = useAuth()
  const { message } = App.useApp()
  const { currentRoom, mutate } = useRoom()
  const { getUserPresence } = usePresence({
    roomId: currentRoom?.id?.toString() || "",
    enabled: !!currentRoom?.id,
  })

  const handleKick = async (userId: string) => {
    if (!currentRoom) return

    try {
      await api.patch(`/rooms/${currentRoom.id}/kick?user=${userId}`)
      message.success("User removed from channel")
      mutate()
    } catch (error) {
      console.error("Error kicking user:", error)
      message.error("Error removing user")
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <Card
        size="small"
        title={
          <Space size={8}>
            <span>Users</span>
            {currentRoom ? (
              <Tag color="blue">{currentRoom?.members?.length}</Tag>
            ) : null}
          </Space>
        }
        className="glass"
        styles={{ body: { background: "transparent" } }}
        variant="outlined"
      >
        {currentRoom ? (
          <List
            size="small"
            dataSource={currentRoom?.members
              ?.slice()
              ?.sort((a, b) => {
                const aPresence = getUserPresence(a.id)
                const bPresence = getUserPresence(b.id)
                const aOnline = aPresence?.isOnline ?? false
                const bOnline = bPresence?.isOnline ?? false
                
                if (aOnline === bOnline) {
                  return a.username.localeCompare(b.username)
                }
                return bOnline ? 1 : -1
              }) ?? []}
            renderItem={(u) => {
              const isAdminSelf = currentRoom?.owner?.id === user?.id
              const isAdminUser = currentRoom?.owner?.id === u?.id
              const presence = getUserPresence(u.id)
              const isOnline = presence?.isOnline ?? false

              return (
                <List.Item
                  className="user-row"
                  actions={
                    isAdminSelf && u?.id !== user?.id
                      ? [
                          <Button
                            key="kick"
                            size="small"
                            type="text"
                            danger
                            icon={<CloseOutlined />}
                            onClick={() => handleKick(u.id.toString())}
                            title={`Remove ${u?.username}`}
                          />,
                        ]
                      : undefined
                  }
                  style={{ paddingLeft: 0, paddingRight: 0 }}
                >
                  <Space size={4}>
                    <Badge status={isOnline ? "success" : "default"} />
                    <Text strong={u?.id === user?.id}>{u?.username}</Text>
                    {isAdminUser ? <Tag color="gold">admin</Tag> : null}
                  </Space>
                </List.Item>
              )
            }}
            locale={{ emptyText: "No users" }}
          />
        ) : (
          <div style={{ display: "grid", placeItems: "center", padding: 24 }}>
            <Empty
              description="Join a channel"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </Card>
    </div>
  )
}
