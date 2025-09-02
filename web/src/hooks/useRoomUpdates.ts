import { useEffect } from "react"
import { useMercure } from "./useMercure"

interface RoomUpdatesHookProps {
  onNewRoom?: (room: Room) => void
  onMemberUpdate?: (update: MemberUpdateData) => void
}

interface MemberUpdateData {
  roomId: number
  roomName: string
  user: {
    id: number
    username: string
  }
  action: "joined" | "left" | "kicked"
  members: Array<{
    id: number
    username: string
  }>
}

export function useRoomUpdates({
  onNewRoom,
  onMemberUpdate,
}: RoomUpdatesHookProps) {
  const { lastMessage: roomMessage } = useMercure({
    topic: "/api/rooms",
  })

  const { lastMessage: memberMessage } = useMercure({
    topic: "/api/rooms/members",
  })

  useEffect(() => {
    if (roomMessage?.data && onNewRoom) {
      const newRoom = roomMessage.data as Room
      onNewRoom(newRoom)
    }
  }, [roomMessage, onNewRoom])

  useEffect(() => {
    if (memberMessage?.data && onMemberUpdate) {
      const memberUpdate = memberMessage.data as MemberUpdateData
      onMemberUpdate(memberUpdate)
    }
  }, [memberMessage, onMemberUpdate])

  return {
    roomMessage,
    memberMessage,
  }
}