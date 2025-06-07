import type { Middleware } from "@reduxjs/toolkit";
import {
  addTypingUser,
  removeTypingUser,
} from "@/lib/redux/slices/typing-slice";
import { getSocket } from "@/features/socket/connection";
import { ChatEventEnum } from "@/lib/socket-event";
import { INITIALIZE_SOCKET } from "@/lib/redux/chatSocketActions";
import type { TypingUser } from "@/features/typing/types";

export const typingMiddleware: Middleware = (store) => (next) => (action) => {
  if (typeof action !== "object" || !action || !("type" in action)) {
    return next(action);
  }

  if (action.type === INITIALIZE_SOCKET) {
    const socket = getSocket();
    if (socket) {
      socket.on(
        ChatEventEnum.TYPING_EVENT,
        (data: { userId: string; chatId: string }) => {
          console.log("User typing event:", data);
          const typingUserIds = store.getState().typing.typingUserIds;
          const exists = typingUserIds.some(
            (u: TypingUser) =>
              u.userId === data.userId && u.chatId === data.chatId
          );

          if (!exists) {
            store.dispatch(addTypingUser(data));

            setTimeout(() => {
              const currentTypingUserIds =
                store.getState().typing.typingUserIds;
              const stillTyping = currentTypingUserIds.some(
                (u: TypingUser) =>
                  u.userId === data.userId && u.chatId === data.chatId
              );
              if (stillTyping) {
                store.dispatch(removeTypingUser(data));
              }
            }, 5000);
          }
        }
      );

      socket.on(
        ChatEventEnum.STOP_TYPING_EVENT,
        (data: { userId: string; chatId: string }) => {
          console.log("User stop typing event:", data);
          store.dispatch(removeTypingUser(data));
        }
      );
    }
  }

  return next(action);
};
