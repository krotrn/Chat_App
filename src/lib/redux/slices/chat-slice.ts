import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatType, MessageType, ConnectionState } from "@/types/ChatType";

interface ChatState {
  connectionState: ConnectionState;
  currentChat: ChatType | null;
  replyMessage: MessageType | null;
  onlineUsers: string[];
}

const initialState: ChatState = {
  connectionState: ConnectionState.DISCONNECTED,
  currentChat: null,
  replyMessage: null,
  onlineUsers: [],
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
      state.onlineUsers = [];
    },
    setReplyMessage(state, action: PayloadAction<MessageType | null>) {
      state.replyMessage = action.payload;
    },
    setOnlineUsers(state, action: PayloadAction<string[]>) {
      state.onlineUsers = action.payload;
    },
    addUserOnline(state, action: PayloadAction<string>) {
      const userId = action.payload;
      if (!state.onlineUsers.includes(userId)) {
        state.onlineUsers.push(userId);
      }
    }
  },
});

export const {
  setConnectionState,
  setCurrentChat,
  clearChatState,
  setReplyMessage,
  setOnlineUsers,
  addUserOnline,
} = chatSlice.actions;

export default chatSlice.reducer;
