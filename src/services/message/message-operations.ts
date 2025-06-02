import {
  api,
  handleApiResponse,
  handleApiError,
  withConnectionCheck,
} from "../api-client";
import { ApiResponse, ChatType, MessageType } from "@/types/ChatType";

// Pin a message in a chat
export const pinMessage = async ({
  chatId,
  messageId,
  token,
}: {
  chatId: string;
  token: string;
  messageId: string;
}): Promise<ChatType> => {
  try {
    return await withConnectionCheck(async () => {
      const response = await api.post<ApiResponse<ChatType>>(
        `/chats/${chatId}/pin/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return handleApiResponse(response);
    });
  } catch (error) {
    return handleApiError(error);
  }
};

// Unpin a message in a chat
export const unpinMessage = async ({
  chatId,
  messageId,
  token,
}: {
  chatId: string;
  messageId: string;
  token: string;
}): Promise<ChatType> => {
  try {
    return await withConnectionCheck(async () => {
      const response = await api.delete<ApiResponse<ChatType>>(
        `/chats/${chatId}/pin/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return handleApiResponse(response);
    });
  } catch (error) {
    return handleApiError(error);
  }
};

// Get all messages with pagination support
export const getAllMessages = async ({
  chatId,
  page,
  limit,
  before,
  after,
  token,
}: {
  chatId: string;
  token: string;
  page?: number;
  limit?: number;
  before?: string;
  after?: string;
}): Promise<{
  messages: MessageType[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}> => {
  const params = new URLSearchParams();
  if (page !== undefined) params.append("page", page.toString());
  if (limit !== undefined) params.append("limit", limit.toString());
  if (before !== undefined) params.append("before", before);
  if (after !== undefined) params.append("after", after);

  const queryString = params.toString();
  const url = queryString
    ? `/messages/${chatId}?${queryString}`
    : `/messages/${chatId}`;

  try {
    return await withConnectionCheck(async () => {
      const response = await api.get<
        ApiResponse<{
          messages: MessageType[];
          pagination: {
            total: number;
            page: number;
            limit: number;
            hasMore: boolean;
          };
        }>
      >(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = handleApiResponse(response);
      return {
        messages: result.messages,
        total: result.pagination.total,
        page: result.pagination.page,
        limit: result.pagination.limit,
        hasMore: result.pagination.hasMore,
      };
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const sendMessage = async ({
  chatId,
  content,
  token,
  attachments,
  replyToId,
  tempId,
}: {
  chatId: string;
  content: string;
  token: string;
  attachments?: File[];
  replyToId?: string;
  tempId?: string;
}) => {
  const formData = new FormData();
  formData.append("content", content);
  if (replyToId) {
    formData.append("replyToId", replyToId);
  }
  if (tempId) {
    formData.append("tempId", tempId);
  }
  if (attachments && attachments.length > 0) {
    attachments.forEach((file) => {
      formData.append("attachments", file);
    });
  }

  try {
    return await withConnectionCheck(async () => {
      const response = await api.post<ApiResponse<MessageType>>(
        `/messages/${chatId}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return handleApiResponse(response);
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteMessage = async ({
  chatId,
  messageId,
  forEveryone,
  token,
}: {
  chatId: string;
  messageId: string;
  forEveryone?: boolean;
  token: string;
}) => {
  try {
    return await withConnectionCheck(async () => {
      if (forEveryone) {
        const response = await api.delete<ApiResponse<MessageType>>(
          `/messages/${chatId}/${messageId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        return handleApiResponse(response);
      } else {
        const response = await api.delete<ApiResponse<MessageType>>(
          `/messages/${chatId}/${messageId}/me`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        return handleApiResponse(response);
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateReaction = async ({
  chatId,
  messageId,
  emoji,
  token,
}: {
  chatId: string;
  messageId: string;
  emoji: string;
  token: string;
}): Promise<MessageType> => {
  try {
    return await withConnectionCheck(async () => {
      const response = await api.patch<ApiResponse<MessageType>>(
        `/messages/${chatId}/${messageId}/reaction`,
        { emoji },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return handleApiResponse(response);
    });
  } catch (error) {
    return handleApiError(error);
  }
};

// Edit a message
export const editMessage = async ({
  chatId,
  messageId,
  content,
  replyToId,
  token,
}: {
  chatId: string;
  messageId: string;
  content: string;
  replyToId?: string;
  token: string;
}) => {
  try {
    return await withConnectionCheck(async () => {
      const response = await api.patch<ApiResponse<MessageType>>(
        `/messages/${chatId}/${messageId}/edit`,
        { content, replyToId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return handleApiResponse(response);
    });
  } catch (error) {
    return handleApiError(error);
  }
};

// Mark messages as read with improved error handling
export const markMessagesAsRead = async ({
  chatId,
  messageIds,
  token,
}: {
  chatId: string;
  messageIds?: string[];
  token: string;
}) => {
  try {
    return await withConnectionCheck(async () => {
      const response = await api.post<ApiResponse<MessageType[]>>(
        `/messages/${chatId}/read`,
        { messageIds },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return handleApiResponse(response);
    });
  } catch (error) {
    return handleApiError(error);
  }
};
