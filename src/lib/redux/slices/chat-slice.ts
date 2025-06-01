import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatType, MessageType, ConnectionState } from "@/types/ChatType";

interface ChatState {
  connectionState: ConnectionState;
  currentChat: ChatType | null;
  replyMessage: MessageType | null;
}

const initialState: ChatState = {
  connectionState: ConnectionState.DISCONNECTED,
  currentChat: null,
  replyMessage: null,
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
    },
    setReplyMessage(state, action: PayloadAction<MessageType | null>) {
      state.replyMessage = action.payload;
    },
  },
});

export const {
  setConnectionState,
  setCurrentChat,
  clearChatState,
  setReplyMessage,
} = chatSlice.actions;

export default chatSlice.reducer;
