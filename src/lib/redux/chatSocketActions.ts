import { ChatType } from "@/types/ChatType";

export const CONNECT_SOCKET = "chat/connectSocket";
export const DISCONNECT_SOCKET = "chat/disconnectSocket";
export interface ConnectSocketPayload {
  chat: ChatType;
  userId: string;
  token: string;
}
