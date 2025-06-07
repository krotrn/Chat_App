import { ChatEventEnum } from "@/lib/socket-event";
import { TypingEvent } from "../types";
import { getSocket } from "@/features/socket/connection";

export class TypingService {
  static emitTyping(data: TypingEvent): boolean {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit(ChatEventEnum.TYPING_EVENT, data);
      return true;
    }
    return false;
  }

  static emitStopTyping(data: TypingEvent): boolean {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit(ChatEventEnum.STOP_TYPING_EVENT, data);
      return true;
    }
    return false;
  }

  static filterTypingUsersByChatId(
    typingUsers: Array<{ userId: string; chatId: string }>,
    chatId: string
  ): string[] {
    return typingUsers
      .filter((typing) => typing.chatId === chatId)
      .map((typing) => typing.userId);
  }

  static addTypingUser(
    typingUsers: Array<{ userId: string; chatId: string }>,
    newTypingUser: { userId: string; chatId: string }
  ): Array<{ userId: string; chatId: string }> {
    const exists = typingUsers.some(
      (user) =>
        user.userId === newTypingUser.userId &&
        user.chatId === newTypingUser.chatId
    );

    if (!exists) {
      return [...typingUsers, newTypingUser];
    }

    return typingUsers;
  }

  static removeTypingUser(
    typingUsers: Array<{ userId: string; chatId: string }>,
    userToRemove: { userId: string; chatId: string }
  ): Array<{ userId: string; chatId: string }> {
    return typingUsers.filter(
      (user) =>
        !(
          user.userId === userToRemove.userId &&
          user.chatId === userToRemove.chatId
        )
    );
  }
}
