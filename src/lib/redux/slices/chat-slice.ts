import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatType, MessageType, ConnectionState } from "@/types/ChatType";

interface ChatState {
  chats: ChatType[];
  messages: MessageType[];
  pinnedMessageIds: string[];
  connectionState: ConnectionState;
  currentChat: ChatType | null;
  replyMessage: MessageType | null;
}

const initialState: ChatState = {
  chats: [],
  messages: [],
  pinnedMessageIds: [],
  connectionState: ConnectionState.DISCONNECTED,
  currentChat: null,
  replyMessage: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChats(state, action: PayloadAction<ChatType[]>) {
      state.chats = action.payload;
    },
    addChat(state, action: PayloadAction<ChatType>) {
      state.chats.push(action.payload);
    },
    updateChat(state, action: PayloadAction<ChatType>) {
      const idx = state.chats.findIndex((c) => c._id === action.payload._id);
      if (idx !== -1) state.chats[idx] = action.payload;
    },
    removeChat(state, action: PayloadAction<string>) {
      state.chats = state.chats.filter((c) => c._id !== action.payload);
    },
    setMessages(state, action: PayloadAction<MessageType[]>) {
      state.messages = action.payload;
    },
    addMessage(state, action: PayloadAction<MessageType>) {
      state.messages.push(action.payload);
    },
    updateMessage(state, action: PayloadAction<MessageType>) {
      const idx = state.messages.findIndex(
        (msg) => msg._id === action.payload._id,
      );
      if (idx !== -1) state.messages[idx] = action.payload;
    },
    removeMessage(state, action: PayloadAction<string>) {
      state.messages = state.messages.filter(
        (msg) => msg._id !== action.payload,
      );
    },
    setPinnedMessageIds(state, action: PayloadAction<string[]>) {
      state.pinnedMessageIds = action.payload;
    },
    addPinnedMessageId(state, action: PayloadAction<string>) {
      if (!state.pinnedMessageIds.includes(action.payload))
        state.pinnedMessageIds.push(action.payload);
    },
    removePinnedMessageId(state, action: PayloadAction<string>) {
      state.pinnedMessageIds = state.pinnedMessageIds.filter(
        (id) => id !== action.payload,
      );
    },
    setConnectionState(state, action: PayloadAction<ConnectionState>) {
      state.connectionState = action.payload;
    },
    setCurrentChat(state, action: PayloadAction<ChatType | null>) {
      state.currentChat = action.payload;
    },
    clearChatState(state) {
      state.messages = [];
      state.pinnedMessageIds = [];
      state.currentChat = null;
      state.connectionState = ConnectionState.DISCONNECTED;
    },
    markMessagesAsReadLocally(state, action: PayloadAction<string[]>) {
      const unreadMessageIds = action.payload;
      state.messages = state.messages.map((msg) =>
        unreadMessageIds.includes(msg._id)
          ? {
              ...msg,
              readBy: [
                ...msg.readBy,
                { userId: "currentUserId", readAt: new Date() },
              ],
            }
          : msg,
      );
    },
    setReplyMessage(state, action: PayloadAction<MessageType | null>) {
      state.replyMessage = action.payload;
    },
  },
});

export const {
  setChats,
  addChat,
  updateChat,
  removeChat,
  setMessages,
  addMessage,
  updateMessage,
  removeMessage,
  setPinnedMessageIds,
  addPinnedMessageId,
  removePinnedMessageId,
  setConnectionState,
  setCurrentChat,
  clearChatState,
  markMessagesAsReadLocally,
  setReplyMessage,
} = chatSlice.actions;

export default chatSlice.reducer;
