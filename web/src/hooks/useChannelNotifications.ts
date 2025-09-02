import { useEffect, useRef, useState } from "react"
import { useMercure } from "./useMercure"

interface ChannelNotificationsState {
  [channelId: number]: boolean
}

export function useChannelNotifications(currentRoomId: number | null) {
  const [notifications, setNotifications] = useState<ChannelNotificationsState>(
    {},
  )
  const lastMessageIdRef = useRef<string | null>(null)

  const { lastMessage } = useMercure({
    topic: "/api/messages",
  })

  useEffect(() => {
    if (lastMessage?.data && currentRoomId && lastMessage.id) {
      if (lastMessageIdRef.current === lastMessage.id) {
        return
      }

      const newMessage = lastMessage.data as { room?: { id?: number } }

      if (newMessage.room?.id) {
        const messageRoomId = newMessage.room.id

        if (messageRoomId !== currentRoomId) {
          setNotifications((prev) => ({
            ...prev,
            [messageRoomId]: true,
          }))
        }
      }

      lastMessageIdRef.current = lastMessage.id
    }
  }, [lastMessage, currentRoomId])

  const clearNotification = (channelId: number) => {
    setNotifications((prev) => {
      const newNotifications = { ...prev }
      delete newNotifications[channelId]
      return newNotifications
    })
  }

  const hasNotification = (channelId: number): boolean => {
    return notifications[channelId] || false
  }

  return {
    hasNotification,
    clearNotification,
    notifications,
  }
}
