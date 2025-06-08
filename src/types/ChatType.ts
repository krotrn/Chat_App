export interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: Date;
}

export interface ReadReceipt {
  userId: string;
  readAt: Date;
}

export interface MessageEdit {
  content: string;
  editedAt: Date;
  editedBy: string;
}

export enum ConnectionState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  RECONNECTING,
  FAILED,
}

export interface AttachmentResponse {
  name: string;
  url: string;
  size: string;
  type: "image" | "video" | "raw" | "auto";
  public_id: string;
}

export interface ParticipantsType {
  userId: string;
  name: string;
  avatarUrl?: string;
  role: "member" | "admin";
  joinedAt: Date;
}

export enum StatusEnum {
  SENDING,
  SENT,
  DELIVERED,
  READ,
  FAILED,
  DELETING,
}

interface MessageUser {
  userId: string;
  name: string;
  avatarUrl: string;
}

export interface MessageType {
  _id: string;
  sender: MessageUser;
  receivers: MessageUser[];
  chatId: string;
  content: string;
  attachments: AttachmentResponse[];
  status: StatusEnum;
  reactions: MessageReaction[];
  isPinned: boolean;
  edited: {
    isEdited: boolean;
    editedAt: Date;
  };
  edits: MessageEdit[];
  readBy: ReadReceipt[];
  deletedFor: DeletedForEntry[];
  replyToId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeletedForEntry {
  userId: string;
  deletedAt: Date;
}

export interface ChatType {
  _id: string;
  name: string;
  lastMessage: MessageType | null;
  avatarUrl: string;
  participants: ParticipantsType[];
  admin: string;
  type: "direct" | "group" | "channel";
  createdBy: string;
  deletedFor: DeletedForEntry[];
  metadata?: {
    pinnedMessage: string[];
    customPermissions?: string[];
  };
  messages: MessageType[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AIModel {
  id: string;
  name: string;
  avatar: string;
  apiKey: string;
  companyId: string;
}

export interface Company {
  id: string;
  name: string;
  models?: AIModel[];
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
  errors?: string[];
}

export interface MessagesPageData {
  messages: MessageType[];
}

export interface CloudinaryUploadResponse {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: "image" | "video" | "raw";
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  status: "pending" | "completed" | "failed";
}

export interface TypingState {
  typingUserIds: TypingUser[];
}

export interface TypingUser {
  userId: string;
  chatId: string;
}

export interface TypingEvent {
  userId: string;
  chatId: string;
}

export interface TypingIndicatorProps {
  isTyping: boolean;
  typingUserIds: string[];
  participants: Array<{
    userId: string;
    name: string;
    avatarUrl?: string;
  }>;
}

export interface UseTypingIndicatorProps {
  chatId: string | null;
  currentUserId: string;
}

export interface UseTypingIndicatorReturn {
  typingUserIds: string[];
  isTyping: boolean;
  handleLocalUserTyping: () => void;
}

export interface ConnectionRecoveryState {
  isRecovering: boolean;
  lastRecoveryAttempt: Date | null;
  recoveryAttempts: number;
}

export interface ConnectionHealthConfig {
  healthCheckInterval: number;
  maxRecoveryAttempts: number;
  recoveryDelay: number;
  staleConnectionThreshold: number;
}

export interface ConnectionRecoveryHookReturn {
  performConnectionRecovery: () => Promise<void>;
  isRecovering: boolean;
}

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
