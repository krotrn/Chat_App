export interface OnlineStatusState {
  onlineUserIds: string[];
  lastUpdated: number | null;
}

export interface UserOnlineEvent {
  userId: string;
}

export interface UserOfflineEvent {
  userId: string;
}

export interface OnlineUsersListEvent {
  onlineUserIds: string[];
}
