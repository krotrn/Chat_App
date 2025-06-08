import type { Middleware } from "@reduxjs/toolkit";
import { emitJoinChat, emitLeaveChat } from "@/features/socket/events";
import {
  JOIN_CHAT_ROOM,
  LEAVE_CHAT_ROOM,
  JoinChatPayload,
} from "@/lib/redux/chatSocketActions";
import { setConnectionState } from "../slices/connection-slice";
import { ConnectionState } from "@/types/ChatType";

export const chatRoomMiddleware: Middleware = (store) => (next) => (action) => {
  if (typeof action !== "object" || !action || !("type" in action)) {
    return next(action);
  }

  switch (action.type) {
    case JOIN_CHAT_ROOM: {
      console.log("ChatRoomMiddleware: JOIN_CHAT_ROOM action received");
      const { chatId } = (action as unknown as { payload: JoinChatPayload })
        .payload;
      emitJoinChat(chatId);
      store.dispatch(setConnectionState(ConnectionState.CONNECTED));
      break;
    }
    case LEAVE_CHAT_ROOM: {
      const { chatId } = (action as unknown as { payload: JoinChatPayload })
        .payload;
      emitLeaveChat(chatId);
      store.dispatch(setConnectionState(ConnectionState.DISCONNECTED));
      console.log("ChatRoomMiddleware: LEAVE_CHAT_ROOM action received");
      break;
    }
  }

  return next(action);
};
