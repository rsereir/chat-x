"use client"
import type { CardProps } from "antd"
import { Card as AntdCard } from "antd"

export default function Card({ styles, bodyStyle, ...props }: CardProps) {
  return (
    <AntdCard
      styles={{
        body: { background: "transparent", ...bodyStyle },
        ...styles,
      }}
      {...props}
    />
  )
}
