export const queryKeys = {
  chats: {
    all: ["chats"],
    lists: () => [...queryKeys.chats.all, "list"],
    list: (filter: { pages?: number; limit?: number }) => [
      ...queryKeys.chats.lists(),
      filter,
    ],
    infinite: (limit: number) => [...queryKeys.chats.all, "infinite", limit],
    details: () => [...queryKeys.chats.all, "details"],
    detail: (chatId: string) => [...queryKeys.chats.details(), chatId],
  },

  messages: {
    all: ["messages"],
    lists: () => [...queryKeys.messages.all, "list"],
    list: (chatId: string, filter: { pages?: number; limit?: number }) => [
      ...queryKeys.messages.lists(),
      chatId,
      filter,
    ],
    infinite: (chatId: string, limit: number) => [
      ...queryKeys.messages.all,
      "infinite",
      chatId,
      limit,
    ],
  },
  connection: {
    health: ["connection", "health"],
  },
  groupChat: {
    detail: (groupChatId: string) => [
      ...queryKeys.chats.details(),
      groupChatId,
    ],
  },
  friends: {
    all: ["friends"],
    lists: () => [...queryKeys.friends.all, "list"],
    list: (filter: { pages?: number; limit?: number }) => [
      ...queryKeys.friends.lists(),
      filter,
    ],
    infinite: (limit: number) => [...queryKeys.friends.all, "infinite", limit],
    details: () => [...queryKeys.friends.all, "details"],
    detail: (friendId: string) => [...queryKeys.friends.details(), friendId],
  }
};
