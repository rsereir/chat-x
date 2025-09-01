"use client"

import { CheckCircleTwoTone, MessageOutlined } from "@ant-design/icons"
import { Layout, Space, Typography } from "antd"
import { useRouter } from "next/navigation"
import Chat from "@/components/chat"
import Members from "@/components/members"
import Rooms from "@/components/rooms"
import Button from "@/components/ui/button"
import Tag from "@/components/ui/tag"
import { RoomProvider } from "@/contexts/RoomContext"
import { useAuth } from "@/hooks/useAuth"
import { isAuthenticated, logout } from "@/utils/auth"

const { Header, Content, Sider } = Layout
const { Title } = Typography

export default function ChatPage() {
  const router = useRouter()
  const { user } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  if (!isAuthenticated()) {
    router.push("/auth")
    return
  }

  return (
    <RoomProvider>
      <Layout style={{ minHeight: "100vh" }}>
        <Header
          style={{
            background: "rgba(255,255,255,0.6)",
            borderBottom: "1px solid rgba(15,23,42,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <Space align="center">
            <MessageOutlined style={{ color: "#0ea5e9" }} />
            <Title level={4} style={{ margin: 0 }}>
              ChatX
            </Title>
          </Space>
          <Space>
            <Tag color="green">
              <Space size={4}>
                <CheckCircleTwoTone twoToneColor="#52c41a" />
                {user?.username || "Anonymous"}
              </Space>
            </Tag>
            <Button onClick={handleLogout}>Logout</Button>
          </Space>
        </Header>
        <Layout>
          <Sider
            width={320}
            style={{
              background: "transparent",
              borderRight: "1px solid rgba(15,23,42,0.06)",
            }}
          >
            <Rooms />
          </Sider>
          <Content>
            <Chat />
          </Content>
          <Sider
            width={280}
            style={{
              background: "transparent",
              borderLeft: "1px solid rgba(15,23,42,0.06)",
            }}
          >
            <Members />
          </Sider>
        </Layout>
      </Layout>
    </RoomProvider>
  )
}
