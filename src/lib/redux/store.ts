import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "@/lib/redux/slices/chat-slice";
import userReducer from "@/lib/redux/slices/user-slice";
import { chatSocketMiddleware } from "@/lib/redux/middleware/chatSocketMiddleware";

export const makeStore = () => {
  return configureStore({
    reducer: {
      chat: chatReducer,
      user: userReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(chatSocketMiddleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
