
export const JOIN_CHAT_ROOM = "chat/joinChatRoom";
export const LEAVE_CHAT_ROOM = "chat/leaveChatRoom";

export const INITIALIZE_SOCKET = "chat/initializeSocket";
export const TERMINATE_SOCKET = "chat/terminateSocket";

export interface JoinChatPayload {
  chatId: string;
}

export interface InitializeSocketPayload {
  token: string;
}
