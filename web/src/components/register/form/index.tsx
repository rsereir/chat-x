'use client'

import { useState } from 'react'
import { Form as AntdForm, App } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { register } from '@/utils/auth'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'

interface FormProps {
  onSuccess?: () => void
}

export default function Form({ onSuccess }: FormProps) {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)

  const doSignup = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      await register({ username: values.username, plainPassword: values.password })
      message.success("Welcome to ChatX, you're now logged in")
      onSuccess?.()
    } catch (error: any) {
      const errorMsg = error?.message || "An error has occurred on account registration"
      message.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AntdForm layout="vertical" onFinish={doSignup}>
      <AntdForm.Item 
        name="username" 
        label="Username" 
        rules={[
          { required: true, min: 3 },
          { 
            pattern: /^[a-zA-Z0-9._]+$/, 
            message: 'Username can only contain letters, numbers, dots and underscores' 
          }
        ]}
      >
        <Input.Text prefix={<UserOutlined />} placeholder="jean31" />
      </AntdForm.Item>
      <AntdForm.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
        <Input.Password prefix={<LockOutlined />} placeholder="•••••••" />
      </AntdForm.Item>
      <Button type="primary" htmlType="submit" block loading={loading}>
        Create my account
      </Button>
    </AntdForm>
  )
}
