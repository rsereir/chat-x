"use client"

import { MessageOutlined } from "@ant-design/icons"
import { Layout, Space, Tabs, Typography } from "antd"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Loading from "@/components/loading"
import LoginForm from "@/components/login/form"
import RegisterForm from "@/components/register/form"
import Card from "@/components/ui/card"
import { useStylesLoaded } from "@/hooks/useStylesLoaded"
import { isAuthenticated } from "@/utils/auth"

const { Header, Content } = Layout
const { Title } = Typography

export default function AuthPage() {
  const router = useRouter()
  const [authTab, setAuthTab] = useState<"login" | "signup">("login")
  const [isHydrated, setIsHydrated] = useState(false)
  const stylesLoaded = useStylesLoaded()

  useEffect(() => {
    setIsHydrated(true)
    
    if (isAuthenticated()) {
      router.push("/")
    }
  }, [router])

  const handleSuccess = () => {
    router.push("/")
  }

  if (!isHydrated || !stylesLoaded) {
    return <Loading />
  }

  return (
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
      </Header>
      <Content
        style={{
          display: "grid",
          placeItems: "center",
          minHeight: "calc(100vh - 64px)",
          padding: 24,
        }}
      >
        <Card className="glass" style={{ width: 420 }}>
          <Tabs
            activeKey={authTab}
            onChange={(k) => setAuthTab(k as "login" | "signup")}
            items={[
              {
                key: "login",
                label: "Log In",
                children: <LoginForm onSuccess={handleSuccess} />,
              },
              {
                key: "signup",
                label: "Create new account",
                children: <RegisterForm onSuccess={handleSuccess} />,
              },
            ]}
          />
        </Card>
      </Content>
    </Layout>
  )
}
