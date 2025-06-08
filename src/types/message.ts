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

export enum StatusEnum {
  SENDING,
  SENT,
  DELIVERED,
  READ,
  FAILED,
  DELETING,
}

export interface MessageUser {
  userId: string;
  name: string;
  avatarUrl: string;
}

export interface DeletedForEntry {
  userId: string;
  deletedAt: Date;
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

export interface AttachmentResponse {
  name: string;
  url: string;
  size: string;
  type: "image" | "video" | "raw" | "auto";
  public_id: string;
}

export interface MessagesPageData {
  messages: MessageType[];
}
