import { PlusOutlined } from "@ant-design/icons"
import { App, Badge, Divider, Form, List, Space } from "antd"
import useSWR from "swr"
import Button from "@/components/ui/button"
import Card from "@/components/ui/card"
import Input from "@/components/ui/input"
import Tag from "@/components/ui/tag"
import { useRoom } from "@/contexts/RoomContext"
import { useAuth } from "@/hooks/useAuth"
import { useChannelNotifications } from "@/hooks/useChannelNotifications"
import { useRoomUpdates } from "@/hooks/useRoomUpdates"
import { type ApiResponse, api } from "@/utils/api"

export default function Rooms() {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const { user } = useAuth()
  const { setCurrentRoomId, currentRoom, mutate: mutateCurrentRoom } = useRoom()

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Room[]>>(
    "/rooms",
    () => api.get<ApiResponse<Room[]>>("/rooms"),
  )

  const rooms = data?.data || []

  const { hasNotification, clearNotification } = useChannelNotifications(
    currentRoom?.id.toString() || null,
  )

  useRoomUpdates({
    onNewRoom: () => {
      mutate()
    },
    onMemberUpdate: (update) => {
      mutate()
      if (currentRoom && update.roomId === currentRoom.id) {
        mutateCurrentRoom()
      }
    },
  })

  const handleSelectRoom = (room: Room) => {
    clearNotification(room.id.toString())
    setCurrentRoomId(room.id)
  }

  const handleJoinRoom = async (room: Room, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await api.patch(`/rooms/${room.id}/join`, {})
      message.success(`Joined room "${room.name}"`)
      mutate()
    } catch (_error) {
      message.error("Failed to join room")
    }
  }

  const handleLeaveRoom = async (room: Room, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await api.patch(`/rooms/${room.id}/leave`, {})
      message.success(`Left room "${room.name}"`)
      mutate()

      if (currentRoom?.id === room.id) {
        setCurrentRoomId(null)
      }
    } catch (_error) {
      message.error("Failed to leave room")
    }
  }

  const handleCreate = (values: { name: string }) => {
    const name = values.name.trim()

    if (!name) return

    if (rooms?.some((r) => r.name === name)) {
      message.info("Channel already exists.")
      return
    }

    api
      .post<Room>("/rooms", { name })
      .then((newRoom) => {
        mutate()
        setCurrentRoomId(newRoom.id)
        message.success(`Channel "${name}" created`)
        form.resetFields()
      })
      .catch(() => message.error("Error creating channel"))
  }

  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <Card
        size="small"
        title={
          <Space size={8}>
            <span>Channels</span>
            <Tag color="blue">{rooms?.length}</Tag>
          </Space>
        }
        className="glass"
      >
        <Form form={form} onFinish={handleCreate}>
          <Space.Compact style={{ width: "100%" }}>
            <Form.Item name="name" style={{ marginBottom: 0, flex: 1 }}>
              <Input.Text
                placeholder="Create channel (eg: general)"
                allowClear
              />
            </Form.Item>
            <Button type="primary" icon={<PlusOutlined />} htmlType="submit" />
          </Space.Compact>
        </Form>
        <Divider style={{ margin: "12px 0" }} />
        <List
          size="small"
          loading={isLoading}
          dataSource={rooms}
          renderItem={(room) => {
            const isActive = currentRoom?.id === room.id
            const hasNewMessage = hasNotification(room.id.toString())
            const isOwner = user && room.owner && room.owner.id === user.id
            const isMember =
              user &&
              room.members &&
              room.members.some((member) => member.id === user.id)

            return (
              <List.Item
                actions={[
                  <span key="member-count">
                    {room.members?.length || 0} user(s)
                  </span>,
                  !isMember ? (
                    <Button
                      key="join"
                      size="small"
                      type="primary"
                      onClick={(e) => handleJoinRoom(room, e)}
                    >
                      Join
                    </Button>
                  ) : !isOwner ? (
                    <Button
                      key="leave"
                      size="small"
                      onClick={(e) => handleLeaveRoom(room, e)}
                    >
                      Leave
                    </Button>
                  ) : null,
                ].filter((action) => !!action)}
                style={{
                  paddingLeft: 0,
                  paddingRight: 0,
                  cursor: "pointer",
                }}
                onClick={() => handleSelectRoom(room)}
              >
                <Space wrap={false}>
                  <Badge dot={hasNewMessage && !isActive}>
                    <Tag color={isActive ? "blue" : "default"}>
                      #{room.name}
                    </Tag>
                  </Badge>
                  {hasNewMessage && !isActive && (
                    <Tag color="red">
                      new
                    </Tag>
                  )}
                </Space>
              </List.Item>
            )
          }}
          locale={{ emptyText: error ? "Loading error" : "No channels" }}
        />
      </Card>
    </div>
  )
}
