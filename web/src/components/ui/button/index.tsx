"use client";
import React from "react";
import { Button as AntdButton } from "antd";
import type { ButtonProps } from "antd";

export default function Button(props: ButtonProps) {
  return <AntdButton {...props} />;
}
