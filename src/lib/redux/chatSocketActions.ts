import { ChatType } from "@/types/ChatType";

export const CONNECT_SOCKET = "chat/connectSocket";
export interface ConnectSocketPayload {
  chat: ChatType;
  userId: string;
  token: string;
}
