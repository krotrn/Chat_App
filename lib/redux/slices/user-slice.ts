import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "next-auth";
interface UserState {
  user: User | null;
  token: string | null;
}

const initialState: UserState = {
  user: null,
  token: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setAuth: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    clearAuth: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setUser, setAuth, clearAuth } = userSlice.actions;
export default userSlice.reducer;
