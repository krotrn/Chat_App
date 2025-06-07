import { emitUserOffline, emitUserOnline } from "@/features/socket/events";

export class OnlineStatusService {
  static setUserOnline(): boolean {
    return emitUserOnline();
  }

  static setUserOffline(): boolean {
    return emitUserOffline();
  }

  static isUserOnline(userId: string, onlineUserIds: string[]): boolean {
    return onlineUserIds.includes(userId);
  }

  static getOnlineUsersCount(onlineUserIds: string[]): number {
    return onlineUserIds.length;
  }

  static filterOnlineUsers(
    userIds: string[],
    onlineUserIds: string[]
  ): string[] {
    return userIds.filter((userId) => onlineUserIds.includes(userId));
  }
}
