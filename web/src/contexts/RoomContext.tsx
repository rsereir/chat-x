"use client"

import { createContext, type ReactNode, useContext, useState } from "react"
import useSWR from "swr"
import { api } from "@/utils/api"

interface RoomContextType {
  currentRoomId: number | null
  setCurrentRoomId: (id: number | null) => void
  currentRoom: Room | null
  isLoading: boolean
  error: Error | null
  mutate: () => void
}

const RoomContext = createContext<RoomContextType | undefined>(undefined)

const fetcher = (url: string) => api.get(url)

interface RoomProviderProps {
  children: ReactNode
}

export function RoomProvider({ children }: RoomProviderProps) {
  const [currentRoomId, setCurrentRoomId] = useState<number | null>(null)

  const {
    data: currentRoom,
    error,
    mutate,
    isLoading,
  } = useSWR(currentRoomId ? `/rooms/${currentRoomId}` : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  })

  return (
    <RoomContext.Provider
      value={{
        currentRoomId,
        setCurrentRoomId,
        currentRoom: currentRoom || null,
        isLoading,
        error,
        mutate,
      }}
    >
      {children}
    </RoomContext.Provider>
  )
}

export function useRoom() {
  const context = useContext(RoomContext)
  if (context === undefined) {
    throw new Error("useRoom must be used within a RoomProvider")
  }
  return context
}
