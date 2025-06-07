import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatType, MessageType, ConnectionState } from "@/types/ChatType";

interface ChatState {
  connectionState: ConnectionState;
  currentChat: ChatType | null;
  replyMessage: MessageType | null;
  onlineUserIds: string[];
  typingUserIds: { userId: string; chatId: string }[];
}

const initialState: ChatState = {
  connectionState: ConnectionState.DISCONNECTED,
  currentChat: null,
  replyMessage: null,
  onlineUserIds: [],
  typingUserIds: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setConnectionState(state, action: PayloadAction<ConnectionState>) {
      state.connectionState = action.payload;
    },
    setCurrentChat(state, action: PayloadAction<ChatType | null>) {
      state.currentChat = action.payload;
    },
    clearChatState(state) {
      state.currentChat = null;
      state.connectionState = ConnectionState.DISCONNECTED;
      state.onlineUserIds = [];
    },
    setReplyMessage(state, action: PayloadAction<MessageType | null>) {
      state.replyMessage = action.payload;
    },
    setonlineUserIds(state, action: PayloadAction<string[]>) {
      state.onlineUserIds = action.payload;
    },
    setTypingUserIds(
      state,
      action: PayloadAction<{ userId: string; chatId: string }[]>
    ) {
      state.typingUserIds = action.payload;
    },
  },
});

export const {
  setConnectionState,
  setCurrentChat,
  clearChatState,
  setReplyMessage,
  setonlineUserIds,
  setTypingUserIds,
} = chatSlice.actions;

export default chatSlice.reducer;
