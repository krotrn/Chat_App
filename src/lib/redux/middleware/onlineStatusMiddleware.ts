import type { Middleware } from "@reduxjs/toolkit";
import {
  setOnlineUserIds,
  addOnlineUser,
  removeOnlineUser,
} from "@/lib/redux/slices/online-users-slice";
import { getSocket } from "@/features/socket/connection";
import { ChatEventEnum } from "@/lib/socket-event";
import { INITIALIZE_SOCKET } from "@/lib/redux/chatSocketActions";

export const onlineStatusMiddleware: Middleware =
  (store) => (next) => (action) => {
    if (typeof action !== "object" || !action || !("type" in action)) {
      return next(action);
    }

    if (action.type === INITIALIZE_SOCKET) {
      const socket = getSocket();
      if (socket) {
        socket.on(
          ChatEventEnum.ONLINE_USERS_LIST_EVENT,
          (data: { onlineUserIds: string[] }) => {
            console.log(
              "Received initial online users list:",
              data.onlineUserIds,
            );
            store.dispatch(setOnlineUserIds(data.onlineUserIds));
          },
        );

        socket.on(
          ChatEventEnum.USER_IS_ONLINE_EVENT,
          (data: { userId: string }) => {
            console.log(`User ${data.userId} is online`);
            store.dispatch(addOnlineUser(data.userId));
          },
        );

        socket.on(
          ChatEventEnum.USER_IS_OFFLINE_EVENT,
          (data: { userId: string }) => {
            console.log(`User ${data.userId} is offline`);
            store.dispatch(removeOnlineUser(data.userId));
          },
        );
      }
    }

    return next(action);
  };
