"use client";
import React from "react";
import { Tag as AntdTag } from "antd";
import type { TagProps } from "antd";

export default function Tag(props: TagProps) {
  return <AntdTag {...props} />;
}
