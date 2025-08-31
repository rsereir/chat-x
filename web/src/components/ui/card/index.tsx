"use client";
import React from "react";
import { Card as AntdCard } from "antd";
import type { CardProps } from "antd";

export default function Card({ styles, bodyStyle, ...props }: CardProps) {
  return (
    <AntdCard
      styles={{ 
        body: { background: "transparent", ...bodyStyle }, 
        ...styles 
      }}
      {...props}
    />
  );
}
