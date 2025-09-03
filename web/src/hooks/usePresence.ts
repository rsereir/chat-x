import { useCallback, useEffect, useState } from "react"
import { useMercure } from "./useMercure"
import { api } from "@/utils/api"

interface UserPresence {
  userId: number
  username: string
  isOnline: boolean
  lastSeen: string
}

interface UsePresenceOptions {
  roomId: string | number
  enabled?: boolean
}

export function usePresence({ roomId, enabled = true }: UsePresenceOptions) {
  const [presences, setPresences] = useState<Map<number, UserPresence>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  
  const { lastMessage } = useMercure({
    topic: `/api/rooms/${roomId}/presence`,
  })

  const sendHeartbeat = useCallback(async () => {
    if (!enabled || !roomId || roomId === "") return
    
    try {
      await api.post('/user-presences', {
        room: `/api/rooms/${roomId}`
      })
    } catch (error) {
      console.error("Failed to send heartbeat:", error)
    }
  }, [roomId, enabled])

  const fetchPresences = useCallback(async () => {
    if (!enabled || !roomId || roomId === "") return
    
    try {
      setIsLoading(true)
      const response = await api.get(`/user-presences?room=/api/rooms/${roomId}`)
      const presenceMap = new Map<number, UserPresence>()
      
      response.data.forEach((presence: any) => {
        presenceMap.set(presence.user.id, {
          userId: presence.user.id,
          username: presence.user.username,
          isOnline: presence.isOnline,
          lastSeen: presence.lastSeen,
        })
      })
      
      setPresences(presenceMap)
    } catch (error) {
      console.error("Failed to fetch presences:", error)
    } finally {
      setIsLoading(false)
    }
  }, [roomId, enabled])

  useEffect(() => {
    if (!enabled) return
    
    fetchPresences()
    const interval = setInterval(sendHeartbeat, 30000)
    sendHeartbeat()

    return () => clearInterval(interval)
  }, [enabled, fetchPresences, sendHeartbeat])

  useEffect(() => {
    if (!lastMessage?.data || !enabled) return

    const data = lastMessage.data as UserPresence
    setPresences(prev => {
      const newMap = new Map(prev)
      newMap.set(data.userId, data)
      return newMap
    })
  }, [lastMessage, enabled])

  useEffect(() => {
    if (!enabled) return

    const checkOfflineUsers = () => {
      const now = new Date()
      setPresences(prev => {
        const newMap = new Map(prev)
        let hasChanges = false
        
        for (const [userId, presence] of newMap) {
          const lastSeenDate = new Date(presence.lastSeen)
          const isOnline = (now.getTime() - lastSeenDate.getTime()) < 60000
          
          if (presence.isOnline !== isOnline) {
            newMap.set(userId, { ...presence, isOnline })
            hasChanges = true
          }
        }
        
        return hasChanges ? newMap : prev
      })
    }

    const interval = setInterval(checkOfflineUsers, 10000)
    return () => clearInterval(interval)
  }, [enabled])

  const getUserPresence = useCallback((userId: number): UserPresence | undefined => {
    return presences.get(userId)
  }, [presences])

  const getOnlineUsers = useCallback((): UserPresence[] => {
    return Array.from(presences.values()).filter(p => p.isOnline)
  }, [presences])

  const getOfflineUsers = useCallback((): UserPresence[] => {
    return Array.from(presences.values()).filter(p => !p.isOnline)
  }, [presences])

  return {
    presences: Array.from(presences.values()),
    getUserPresence,
    getOnlineUsers,
    getOfflineUsers,
    isLoading,
    sendHeartbeat,
    refetch: fetchPresences,
  }
}