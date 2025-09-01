"use client"

import { LockOutlined, UserOutlined } from "@ant-design/icons"
import { Form as AntdForm, App } from "antd"
import { useState } from "react"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import { setToken } from "@/utils/auth"
import { api } from "@/utils/api"

interface FormProps {
  onSuccess?: () => void
}

export default function Form({ onSuccess }: FormProps) {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)

  const handleRegister = async (values: {
    username: string
    password: string
  }) => {
    setLoading(true)
    try {
      const data = await api.post<{ token?: string }>("/register", {
        username: values.username,
        plainPassword: values.password,
      })

      const token = data.token
      if (token) {
        setToken(token)
      }

      message.success("Welcome to ChatX !")
      onSuccess?.()
    } catch (error: unknown) {
      let errorMsg = "An error has occurred on account registration"

      if (error instanceof Error) {
        if (error.message.includes("violations")) {
          try {
            const errorData = JSON.parse(error.message)
            if (errorData.violations) {
              errorMsg = errorData.violations
                .map((v: { message: string }) => v.message)
                .join(", ")
            }
          } catch {
            errorMsg = error.message
          }
        } else {
          errorMsg = error.message
        }
      }

      message.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AntdForm layout="vertical" onFinish={handleRegister}>
      <AntdForm.Item
        name="username"
        label="Username"
        rules={[
          { required: true, min: 3 },
          {
            pattern: /^[a-zA-Z0-9._]+$/,
            message:
              "Username can only contain letters, numbers, dots and underscores",
          },
        ]}
      >
        <Input.Text prefix={<UserOutlined />} placeholder="jean31" />
      </AntdForm.Item>
      <AntdForm.Item
        name="password"
        label="Password"
        rules={[{ required: true, min: 6 }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="•••••••" />
      </AntdForm.Item>
      <Button type="primary" htmlType="submit" block loading={loading}>
        Create my account
      </Button>
    </AntdForm>
  )
}
