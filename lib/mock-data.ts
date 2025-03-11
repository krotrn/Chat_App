import { User } from "next-auth";
import type { Chat } from "@/types/ChatType"

export const mockUsers: User[] = [
  {
    id: "user-1",
    username:"test",
    name: "John Doe",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    role: "admin",
  },
  {
    id: "user-2",
    username:"test",
    name: "Jane Smith",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    role: "user",
  },
  {
    id: "user-3",
    username:"test",
    name: "Bob Johnson",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    role: "user",
  },
  {
    id: "user-4",
    username:"test",
    name: "Alice Williams",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    role: "user",
  },
  {
    id: "user-5",
    username:"test",
    name: "Charlie Brown",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    role: "user",
  },
]

export const mockChats: Chat[] = [
  {
    id: "chat-1",
    name: "Team Project",
    avatar: "/placeholder.svg?height=40&width=40",
    isGroup: true,
    lastMessage: {
      content: "Let's discuss the new features",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    messages: [
      {
        id: "msg-1",
        content: "Hey team, how's the progress?",
        senderId: "user-1",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        status: "read",
      },
      {
        id: "msg-2",
        content: "I've completed the UI design",
        senderId: "user-2",
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        status: "read",
      },
      {
        id: "msg-3",
        content: "Let's discuss the new features",
        senderId: "user-3",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        status: "delivered",
      },
    ],
    participants: ["user-1", "user-2", "user-3", "user-4"],
    adminIds: ["user-1"],
    unreadCount: 1,
  },
  {
    id: "chat-2",
    name: "Jane Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    isGroup: false,
    lastMessage: {
      content: "Can we meet tomorrow?",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    messages: [
      {
        id: "msg-4",
        content: "Hi Jane, how are you?",
        senderId: "user-1",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        status: "read",
      },
      {
        id: "msg-5",
        content: "I'm good, thanks! How about you?",
        senderId: "user-2",
        timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
        status: "read",
      },
      {
        id: "msg-6",
        content: "Can we meet tomorrow?",
        senderId: "user-1",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        status: "delivered",
      },
    ],
    participants: ["user-1", "user-2"],
    unreadCount: 0,
  },
  {
    id: "chat-3",
    name: "Marketing Group",
    avatar: "/placeholder.svg?height=40&width=40",
    isGroup: true,
    lastMessage: {
      content: "The campaign is live now",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    messages: [
      {
        id: "msg-7",
        content: "Has everyone reviewed the marketing materials?",
        senderId: "user-5",
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        status: "read",
      },
      {
        id: "msg-8",
        content: "Yes, they look great!",
        senderId: "user-1",
        timestamp: new Date(Date.now() - 1000 * 60 * 175).toISOString(),
        status: "read",
      },
      {
        id: "msg-9",
        content: "The campaign is live now",
        senderId: "user-5",
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        status: "read",
      },
    ],
    participants: ["user-1", "user-3", "user-5"],
    adminIds: ["user-5"],
    unreadCount: 0,
  },
  {
    id: "chat-4",
    name: "Bob Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    isGroup: false,
    lastMessage: {
      content: "Did you check the latest report?",
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    },
    messages: [
      {
        id: "msg-10",
        content: "Hey Bob, did you check the latest report?",
        senderId: "user-1",
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        status: "read",
      },
    ],
    participants: ["user-1", "user-3"],
    unreadCount: 0,
  },
  {
    id: "chat-5",
    name: "Support Team",
    avatar: "/placeholder.svg?height=40&width=40",
    isGroup: true,
    lastMessage: {
      content: "New ticket assigned to you",
      timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    },
    messages: [
      {
        id: "msg-11",
        content: "New ticket assigned to you",
        senderId: "user-4",
        timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
        status: "read",
      },
    ],
    participants: ["user-1", "user-2", "user-4"],
    adminIds: ["user-4"],
    unreadCount: 0,
  },
]

