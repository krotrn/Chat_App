import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ConnectionState } from "@/types";

interface ConnectionSliceState {
  connectionState: ConnectionState;
}

const initialState: ConnectionSliceState = {
  connectionState: ConnectionState.DISCONNECTED,
};

const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    setConnectionState: (state, action: PayloadAction<ConnectionState>) => {
      state.connectionState = action.payload;
    },
    resetConnectionState: (state) => {
      state.connectionState = ConnectionState.DISCONNECTED;
    },
  },
});

export const { setConnectionState, resetConnectionState } =
  connectionSlice.actions;
export default connectionSlice.reducer;
