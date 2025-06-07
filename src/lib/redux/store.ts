import { configureStore } from "@reduxjs/toolkit";
import userReducer from "@/lib/redux/slices/user-slice";
import connectionReducer from "@/lib/redux/slices/connection-slice";
import onlineUsersReducer from "@/lib/redux/slices/online-users-slice";
import typingReducer from "@/lib/redux/slices/typing-slice";
import currentChatReducer from "@/lib/redux/slices/current-chat-slice";
import { chatSocketMiddlewares } from "@/lib/redux/middleware";

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      connection: connectionReducer,
      onlineUsers: onlineUsersReducer,
      typing: typingReducer,
      currentChat: currentChatReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(...chatSocketMiddlewares),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
