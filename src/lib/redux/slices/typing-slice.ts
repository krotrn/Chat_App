import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { TypingState, TypingUser } from "@/features/typing/types";

const initialState: TypingState = {
  typingUserIds: [],
};

const typingSlice = createSlice({
  name: "typing",
  initialState,
  reducers: {
    setTypingUserIds: (state, action: PayloadAction<TypingUser[]>) => {
      state.typingUserIds = action.payload;
    },
    addTypingUser: (state, action: PayloadAction<TypingUser>) => {
      const exists = state.typingUserIds.some(
        (user) =>
          user.userId === action.payload.userId &&
          user.chatId === action.payload.chatId
      );
      if (!exists) {
        state.typingUserIds.push(action.payload);
      }
    },
    removeTypingUser: (state, action: PayloadAction<TypingUser>) => {
      state.typingUserIds = state.typingUserIds.filter(
        (user) =>
          !(
            user.userId === action.payload.userId &&
            user.chatId === action.payload.chatId
          )
      );
    },
    clearTypingUsers: (state) => {
      state.typingUserIds = [];
    },
    clearTypingUsersForChat: (state, action: PayloadAction<string>) => {
      state.typingUserIds = state.typingUserIds.filter(
        (user) => user.chatId !== action.payload
      );
    },
  },
});

export const {
  setTypingUserIds,
  addTypingUser,
  removeTypingUser,
  clearTypingUsers,
  clearTypingUsersForChat,
} = typingSlice.actions;
export default typingSlice.reducer;
