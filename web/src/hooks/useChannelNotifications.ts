import { useEffect, useState } from "react"
import { useMercure } from "./useMercure"

interface ChannelNotificationsState {
  [channelId: string]: boolean
}

export function useChannelNotifications(currentRoomId: string | null) {
  const [notifications, setNotifications] = useState<ChannelNotificationsState>(
    {},
  )

  const { lastMessage } = useMercure({
    topic: "/api/messages",
  })

  useEffect(() => {
    if (lastMessage?.data && currentRoomId) {
      const newMessage = lastMessage.data as { room: { id: number } }
      const messageRoomId = newMessage.room.id.toString()

      if (messageRoomId !== currentRoomId) {
        setNotifications((prev) => ({
          ...prev,
          [messageRoomId]: true,
        }))
      }
    }
  }, [lastMessage, currentRoomId])

  const clearNotification = (channelId: string) => {
    setNotifications((prev) => {
      const newNotifications = { ...prev }
      delete newNotifications[channelId]
      return newNotifications
    })
  }

  const hasNotification = (channelId: string): boolean => {
    return notifications[channelId] || false
  }

  return {
    hasNotification,
    clearNotification,
    notifications,
  }
}
