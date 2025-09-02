import { Spin } from "antd"

interface LoadingProps {
  size?: "small" | "default" | "large"
}

export default function Loading({ size = "large" }: LoadingProps) {
  return (
    <div 
      style={{ 
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 9999
      }}
    >
      <Spin size={size} />
    </div>
  )
}