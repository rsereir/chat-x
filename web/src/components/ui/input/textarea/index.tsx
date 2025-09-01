"use client"
import { Input } from "antd"
import type { TextAreaProps } from "antd/es/input"

export default function TextAreaInput(props: TextAreaProps) {
  return <Input.TextArea {...props} />
}
