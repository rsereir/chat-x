export {}

declare global {
  type User = {
    id: number
    username: string
  }

  type Room = {
    id: number
    name: string
    owner: User
    members?: User[]
  }

  type ChatMessage = {
    id: number
    room: Room
    author: User
    content: string
    createdAt: string
  }
}
