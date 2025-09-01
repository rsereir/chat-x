"use client"
import type { TagProps } from "antd"
import { Tag as AntdTag } from "antd"

export default function Tag(props: TagProps) {
  return <AntdTag {...props} />
}
