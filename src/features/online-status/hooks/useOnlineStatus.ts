import { useAppSelector } from "@/hooks/useReduxType";
import { OnlineStatusService } from "../services/onlineStatusService";

export function useOnlineStatus() {
  const onlineUserIds = useAppSelector(
    (state) => state.onlineUsers.onlineUserIds
  );

  const isUserOnline = (userId: string): boolean => {
    return OnlineStatusService.isUserOnline(userId, onlineUserIds);
  };

  const getOnlineUsersCount = (): number => {
    return OnlineStatusService.getOnlineUsersCount(onlineUserIds);
  };

  const filterOnlineUsers = (userIds: string[]): string[] => {
    return OnlineStatusService.filterOnlineUsers(userIds, onlineUserIds);
  };

  const setUserOnline = (): boolean => {
    return OnlineStatusService.setUserOnline();
  };

  const setUserOffline = (): boolean => {
    return OnlineStatusService.setUserOffline();
  };

  return {
    onlineUserIds,
    isUserOnline,
    getOnlineUsersCount,
    filterOnlineUsers,
    setUserOnline,
    setUserOffline,
  };
}
