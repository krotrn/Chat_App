import { connectionMiddleware } from "./connectionMiddleware";
import { onlineStatusMiddleware } from "./onlineStatusMiddleware";
import { typingMiddleware } from "./typingMiddleware";
import { chatRoomMiddleware } from "./chatRoomMiddleware";
import { QueryClient } from "@tanstack/react-query";

let queryClient: QueryClient | null = null;
export function setQueryClient(client: QueryClient) {
  queryClient = client;
}

export { queryClient };

export const chatSocketMiddlewares = [
  connectionMiddleware,
  onlineStatusMiddleware,
  typingMiddleware,
  chatRoomMiddleware,
];
