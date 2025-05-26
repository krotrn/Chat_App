import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './slices/chat-slice';
import { chatSocketMiddleware } from './middleware/chatSocketMiddleware';
import userReducer from './slices/user-slice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    user: userReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(chatSocketMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;