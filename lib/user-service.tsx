import type { FriendRequest, User } from "@/types/ChatType"
import { v4 as uuidv4 } from "uuid"

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    bio: "Software developer passionate about building great user experiences",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "user",
    status: "online",
    friends: ["user-2", "user-3"],
    friendRequests: {
      incoming: [],
      outgoing: [],
    },
  },
  {
    id: "user-2",
    name: "Jane Smith",
    email: "jane@example.com",
    bio: "UX designer with a focus on accessibility",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "user",
    status: "offline",
    lastSeen: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    friends: ["user-1"],
    friendRequests: {
      incoming: [],
      outgoing: [],
    },
  },
  {
    id: "user-3",
    name: "Bob Johnson",
    email: "bob@example.com",
    bio: "Product manager and tech enthusiast",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "user",
    status: "away",
    lastSeen: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    friends: ["user-1"],
    friendRequests: {
      incoming: [],
      outgoing: [],
    },
  },
  {
    id: "user-4",
    name: "Alice Williams",
    email: "alice@example.com",
    bio: "Full-stack developer and open source contributor",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "user",
    status: "offline",
    lastSeen: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    friends: [],
    friendRequests: {
      incoming: [
        {
          id: "request-1",
          senderId: "user-1",
          receiverId: "user-4",
          status: "pending",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
      ],
      outgoing: [],
    },
  },
  {
    id: "user-5",
    name: "Charlie Brown",
    email: "charlie@example.com",
    bio: "DevOps engineer and cloud specialist",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "user",
    status: "online",
    friends: [],
    friendRequests: {
      incoming: [],
      outgoing: [
        {
          id: "request-2",
          senderId: "user-5",
          receiverId: "user-1",
          status: "pending",
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
      ],
    },
  },
]

/**
 * Get the current user
 */
export async function getUser(): Promise<User> {
  // In a real app, you'd fetch from a database based on the session
  return mockUsers[0]
}

/**
 * Get a user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  // In a real app, you'd fetch from a database
  return mockUsers.find((user) => user.id === userId) || null
}

/**
 * Get a user's online status
 */
export async function getUserOnlineStatus(userId: string): Promise<boolean> {
  // In a real app, you'd fetch from a database or presence system
  const user = await getUserById(userId)
  return user?.status === "online"
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, data: Partial<User>): Promise<User> {
  // In a real app, you'd update the database
  const userIndex = mockUsers.findIndex((user) => user.id === userId)
  if (userIndex === -1) {
    throw new Error("User not found")
  }

  // Update user data
  mockUsers[userIndex] = {
    ...mockUsers[userIndex],
    ...data,
  }

  return mockUsers[userIndex]
}

/**
 * Search users by name or email
 */
export async function searchUsers(query: string): Promise<User[]> {
  // In a real app, you'd search the database
  if (!query) return []

  const lowerQuery = query.toLowerCase()
  return mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(lowerQuery) || (user.email && user.email.toLowerCase().includes(lowerQuery)),
  )
}


/**
 * Get user's incoming friend requests
 */
export async function getIncomingFriendRequests(userId: string): Promise<Array<FriendRequest & { sender: User }>> {
  // In a real app, you'd fetch from a database
  const user = await getUserById(userId)
  if (!user || !user.friendRequests?.incoming) return []

  return Promise.all(
    user.friendRequests.incoming.map(async (request) => {
      const sender = await getUserById(request.senderId)
      return {
        ...request,
        sender: sender as User,
      }
    }),
  )
}

/**
 * Send a friend request
 */
export async function sendFriendRequest(senderId: string, receiverId: string): Promise<FriendRequest> {
  // In a real app, you'd update the database
  const sender = await getUserById(senderId)
  const receiver = await getUserById(receiverId)

  if (!sender || !receiver) {
    throw new Error("User not found")
  }

  // Check if already friends
  if (sender.friends?.includes(receiverId)) {
    throw new Error("Already friends with this user")
  }

  // Check if request already exists
  const existingOutgoingRequest = sender.friendRequests?.outgoing.find(
    (req) => req.receiverId === receiverId && req.status === "pending",
  )

  if (existingOutgoingRequest) {
    throw new Error("Friend request already sent")
  }

  // Create new request
  const request: FriendRequest = {
    id: uuidv4(),
    senderId,
    receiverId,
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  // Update sender's outgoing requests
  const senderIndex = mockUsers.findIndex((user) => user.id === senderId)
  if (!mockUsers[senderIndex].friendRequests) {
    mockUsers[senderIndex].friendRequests = { incoming: [], outgoing: [] }
  }
  mockUsers[senderIndex].friendRequests!.outgoing.push(request)

  // Update receiver's incoming requests
  const receiverIndex = mockUsers.findIndex((user) => user.id === receiverId)
  if (!mockUsers[receiverIndex].friendRequests) {
    mockUsers[receiverIndex].friendRequests = { incoming: [], outgoing: [] }
  }
  mockUsers[receiverIndex].friendRequests!.incoming.push(request)

  return request
}

/**
 * Handle a friend request (accept, reject, block)
 */
export async function handleFriendRequest(
  requestId: string,
  userId: string,
  action: "accept" | "reject" | "block",
): Promise<void> {
  // In a real app, you'd update the database
  const user = await getUserById(userId)
  if (!user || !user.friendRequests?.incoming) {
    throw new Error("User not found")
  }

  const requestIndex = user.friendRequests.incoming.findIndex((req) => req.id === requestId)
  if (requestIndex === -1) {
    throw new Error("Friend request not found")
  }

  const request = user.friendRequests.incoming[requestIndex]
  const sender = await getUserById(request.senderId)

  if (!sender || !sender.friendRequests?.outgoing) {
    throw new Error("Sender not found")
  }

  // Update request status
  request.status = action === "accept" ? "accepted" : action === "reject" ? "rejected" : "blocked"

  // Update sender's outgoing request
  const senderRequestIndex = sender.friendRequests.outgoing.findIndex((req) => req.id === requestId)
  if (senderRequestIndex !== -1) {
    sender.friendRequests.outgoing[senderRequestIndex].status = action === "accept" ? "accepted" : action === "reject" ? "rejected" : "blocked"
  }

  // If accepted, add to friends list
  if (action === "accept") {
    if (!user.friends) user.friends = []
    if (!sender.friends) sender.friends = []

    user.friends.push(sender.id)
    sender.friends.push(user.id)
  }

  // Remove the request from the lists
  const userIndex = mockUsers.findIndex((u) => u.id === userId)
  mockUsers[userIndex].friendRequests!.incoming = mockUsers[userIndex].friendRequests!.incoming.filter(
    (req) => req.id !== requestId,
  )

  const senderIndex = mockUsers.findIndex((u) => u.id === sender.id)
  mockUsers[senderIndex].friendRequests!.outgoing = mockUsers[senderIndex].friendRequests!.outgoing.filter(
    (req) => req.id !== requestId,
  )
}

