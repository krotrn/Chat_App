import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatType, MessageType } from "@/types";

interface CurrentChatState {
  currentChat: ChatType | null;
  replyMessage: MessageType | null;
}

const initialState: CurrentChatState = {
  currentChat: null,
  replyMessage: null,
};

const currentChatSlice = createSlice({
  name: "currentChat",
  initialState,
  reducers: {
    setCurrentChat: (state, action: PayloadAction<ChatType | null>) => {
      state.currentChat = action.payload;
    },
    setReplyMessage: (state, action: PayloadAction<MessageType | null>) => {
      state.replyMessage = action.payload;
    },
    clearCurrentChat: (state) => {
      state.currentChat = null;
      state.replyMessage = null;
    },
    updateCurrentChatLastMessage: (
      state,
      action: PayloadAction<MessageType>,
    ) => {
      if (
        state.currentChat &&
        state.currentChat._id === action.payload.chatId
      ) {
        state.currentChat.lastMessage = action.payload;
      }
    },
  },
});

export const {
  setCurrentChat,
  setReplyMessage,
  clearCurrentChat,
  updateCurrentChatLastMessage,
} = currentChatSlice.actions;
export default currentChatSlice.reducer;
