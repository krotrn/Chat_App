import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface OnlineStatusState {
  onlineUserIds: string[];
  lastUpdated: number | null;
}
const initialState: OnlineStatusState = {
  onlineUserIds: [],
  lastUpdated: null,
};

const onlineUsersSlice = createSlice({
  name: "onlineUsers",
  initialState,
  reducers: {
    setOnlineUserIds: (state, action: PayloadAction<string[]>) => {
      state.onlineUserIds = action.payload;
      state.lastUpdated = Date.now();
    },
    addOnlineUser: (state, action: PayloadAction<string>) => {
      if (!state.onlineUserIds.includes(action.payload)) {
        state.onlineUserIds.push(action.payload);
        state.lastUpdated = Date.now();
      }
    },
    removeOnlineUser: (state, action: PayloadAction<string>) => {
      state.onlineUserIds = state.onlineUserIds.filter(
        (userId) => userId !== action.payload
      );
      state.lastUpdated = Date.now();
    },
    clearOnlineUsers: (state) => {
      state.onlineUserIds = [];
      state.lastUpdated = Date.now();
    },
  },
});

export const {
  setOnlineUserIds,
  addOnlineUser,
  removeOnlineUser,
  clearOnlineUsers,
} = onlineUsersSlice.actions;
export default onlineUsersSlice.reducer;
