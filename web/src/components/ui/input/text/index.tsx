"use client";
import React from "react";
import { Input } from "antd";
import type { InputProps } from "antd";

export default function TextInput(props: InputProps) {
  return <Input {...props} />;
}
