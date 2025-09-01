"use client"
import type { ButtonProps } from "antd"
import { Button as AntdButton } from "antd"

export default function Button(props: ButtonProps) {
  return <AntdButton {...props} />
}
