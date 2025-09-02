import { Typography } from "antd"
import dayjs from "dayjs"

const { Text } = Typography

interface MessageProps {
  message: ChatMessage
  isMine: boolean
}

export default function Message({ message, isMine }: MessageProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isMine ? "flex-end" : "flex-start",
      }}
    >
      <div
        className={isMine ? "bubble-mine" : "bubble-other"}
        style={{
          maxWidth: "70%",
          padding: "10px 14px",
          borderRadius: 14,
          borderTopLeftRadius: isMine ? 14 : 4,
          borderTopRightRadius: isMine ? 4 : 14,
          wordWrap: "break-word",
          wordBreak: "break-word",
          overflowWrap: "break-word",
          hyphens: "auto",
        }}
      >
        <div style={{ marginBottom: 4 }}>
          <Text style={{ color: isMine ? "#e6f4ff" : "#64748b" }} strong>
            {message.author?.username} · {dayjs(new Date(message.createdAt).getTime()).format("HH:mm")}
          </Text>
        </div>
        <div 
          style={{
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            wordBreak: "break-word",
            overflowWrap: "break-word"
          }}
        >
          {message.content}
        </div>
      </div>
    </div>
  )
}
