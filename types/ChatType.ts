export interface MessageReaction {
  emoji: string
  userId: string
  timestamp: string
}

export interface Message {
  id: string
  content: string
  senderId: string
  timestamp: string
  status: "sent" | "delivered" | "read"
  replyToId?: string
  reactions?: MessageReaction[]
  attachments?: Array<{
    url: string
    type: string
    name: string
  }>
}
export interface Chat {
  id: string
  name: string
  avatar: string
  isGroup: boolean
  lastMessage?: {
    content: string
    timestamp: string
  }
  messages: Message[]
  participants?: string[]
  adminIds?: string[]
  unreadCount: number
}
export interface AIModel {
  id: string
  name: string
  avatar: string
  apiKey: string
  companyId: string
}

export interface Company {
  id: string
  name: string
  models?: AIModel[]
}

export interface AIMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

