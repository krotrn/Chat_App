import axios from "axios";
import { config } from "@/config";
import { ChatType, MessageType, ParticipantsType } from "@/types/ChatType";

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
  errors?: string[];
}

interface ApiErrorData {
  statusCode: number;
  errors?: string[];
}

let isConnectionIssue = false;

const api = axios.create({
  baseURL: `${config.chatApiUrl}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const handleApiResponse = <T>(response: { data: ApiResponse<T> }): T => {
  if (!response.data) {
    throw new Error("No response data received");
  }

  if (!response.data.success) {
    const errorMessage = response.data.message || "API request failed";
    const error = new Error(errorMessage) as Error & ApiErrorData;
    error.statusCode = response.data.statusCode;
    error.errors = response.data.errors;
    throw error;
  }

  return response.data.data;
};

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

const handleApiError = (error: unknown): never => {
  console.log("API Error:", error);

  if (
    error instanceof Error &&
    typeof error === "object" &&
    error !== null &&
    "config" in error &&
    !("response" in error)
  ) {
    throw new NetworkError(
      "Network connection failed. Please check your connection or try again later.",
    );
  }

  if (error instanceof Error) {
    console.log("Error message:", error.message);
    throw error;
  }

  throw new Error("An unknown error occurred");
};

api.interceptors.response.use(
  (response) => {
    console.log("Response received:", response.status, response.config.url);
    return response;
  },
  (error) => {
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject(
        new NetworkError(
          "No response received from server. Please check your connection.",
        ),
      );
    } else if (error.response) {
      console.error(
        "Error response:",
        error.response.status,
        error.response.data,
      );
      return Promise.reject(error.response.data);
    } else {
      console.error("Error message:", error.message);
      return Promise.reject(error);
    }
  },
);

export const setAuthToken = (token: string) => {
  if (!token) {
    console.error("No access token found");
    return;
  }
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export const isConnectionHealthy = (): boolean => {
  return !isConnectionIssue;
};

// Explicitly check connection health
export const checkConnectionHealth = async (): Promise<boolean> => {
  try {
    await api.get("/ping", {
      timeout: 3000,
    });

    isConnectionIssue = false;
    return true;
  } catch (error) {
    console.log("Connection health check failed:", error);
    isConnectionIssue = true;
    return false;
  }
};

export const ensureConnection = async (): Promise<boolean> => {
  if (isConnectionIssue) {
    return await checkConnectionHealth();
  }
  return true;
};

export const withConnectionCheck = async <T>(
  apiCall: () => Promise<T>,
): Promise<T> => {
  const isConnected = await ensureConnection();
  if (!isConnected) {
    throw new NetworkError(
      "Server is currently unavailable. Please try again later.",
    );
  }
  return apiCall();
};

// Fetch all chats
export const fetchChats = async (
  limit?: number,
  page?: number,
): Promise<{
  chats: ChatType[];
  totals: number;
  page: number;
  limit: number;
  hasMore: boolean;
}> => {
  const params = new URLSearchParams();
  if (page !== undefined) params.append("page", page.toString());
  if (limit !== undefined) params.append("limit", limit.toString());
  const queryString = params.toString();
  const url = queryString ? `/chats?${queryString}` : `/chats`;

  try {
    const response = await api.get<
      ApiResponse<{
        chats: ChatType[];
        totals: number;
        page: number;
        limit: number;
        hasMore: boolean;
      }>
    >(url, { withCredentials: true });
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return handleApiError(error);
  }
};

// Create or get a one-on-one chat
export const createOrGetAOneOnOneChat = async ({
  participants,
  name,
}: {
  participants: ParticipantsType[];
  name: string;
}): Promise<ChatType> => {
  try {
    const response = await api.post<ApiResponse<ChatType>>("/chats", {
      participants,
      name,
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error creating or getting one-on-one chat:", error);
    return handleApiError(error);
  }
};

// Get chat By id
export const getChatById = async ({
  chatId,
}: {
  chatId: string;
}): Promise<ChatType> => {
  try {
    const response = await api.get<ApiResponse<ChatType>>(
      `/chats/chat/${chatId}`,
      {
        withCredentials: true,
      },
    );
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error fetching chat by ID:", error);
    return handleApiError(error);
  }
};

// Delete a one-on-one chat
export const deleteOneOnOneChat = async ({
  chatId,
  forEveryone,
}: {
  chatId: string;
  forEveryone?: boolean;
}): Promise<null> => {
  try {
    if (forEveryone) {
      const response = await api.delete<ApiResponse<null>>(
        `/chats/chat/${chatId}`,
      );
      return handleApiResponse(response);
    }
    // If forEveryone is false, delete the chat for the current user only
    const response = await api.delete<ApiResponse<null>>(`/chats/${chatId}/me`);
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error deleting chat:", error);
    return handleApiError(error);
  }
};

// Create a group chat
export const createAGroupChat = async ({
  participants,
  name,
}: {
  name: string;
  participants: ParticipantsType[];
}): Promise<ChatType> => {
  try {
    const response = await api.post<ApiResponse<ChatType>>("/chats/group", {
      participants,
      name,
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error creating group chat:", error);
    return handleApiError(error);
  }
};

// Get group chat details
export const getGroupChatDetails = async ({
  chatId,
}: {
  chatId: string;
}): Promise<ChatType> => {
  try {
    const response = await api.get<ApiResponse<ChatType>>(
      `/chats/group/${chatId}`,
    );
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error fetching group chat details:", error);
    return handleApiError(error);
  }
};

// Rename a group chat
export const updateGroupChat = async ({
  chatId,
  name,
  avatarUrl,
}: {
  chatId: string;
  name: string;
  avatarUrl: string;
}): Promise<ChatType> => {
  try {
    const response = await api.patch<ApiResponse<ChatType>>(
      `/chats/group/${chatId}`,
      { name, avatarUrl },
    );
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error renaming group chat:", error);
    return handleApiError(error);
  }
};

// Delete a group chat
export const deleteGroupChat = async ({
  chatId,
}: {
  chatId: string;
}): Promise<null> => {
  try {
    const response = await api.delete<ApiResponse<null>>(
      `/chats/group/${chatId}`,
    );
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error deleting group chat:", error);
    return handleApiError(error);
  }
};

// Add a new participant to a group chat
export const addNewParticipantInGroupChat = async ({
  chatId,
  participants,
}: {
  chatId: string;
  participants: ParticipantsType[];
}): Promise<ChatType> => {
  try {
    const response = await api.post<ApiResponse<ChatType>>(
      `/chats/group/${chatId}/participant`,
      { participants },
    );
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error adding participant to group chat:", error);
    return handleApiError(error);
  }
};

// Remove a participant from a group chat
export const removeParticipantFromGroupChat = async ({
  chatId,
  participantId,
}: {
  chatId: string;
  participantId: string;
}): Promise<ChatType> => {
  try {
    const response = await api.delete<ApiResponse<ChatType>>(
      `/chats/group/${chatId}/participant/${participantId}`,
    );
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error removing participant from group chat:", error);
    return handleApiError(error);
  }
};

// Leave a group chat
export const leaveGroupChat = async ({
  chatId,
}: {
  chatId: string;
}): Promise<ChatType> => {
  try {
    const response = await api.delete<ApiResponse<ChatType>>(
      `/chats/group/${chatId}/leave`,
    );
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error leaving group chat:", error);
    return handleApiError(error);
  }
};

// Pin a message in a chat
export const pinMessage = async ({
  chatId,
  messageId,
}: {
  chatId: string;
  messageId: string;
}): Promise<ChatType> => {
  try {
    const response = await api.post<ApiResponse<ChatType>>(
      `/chats/${chatId}/pin/${messageId}`,
      {},
    );
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error pinning message:", error);
    return handleApiError(error);
  }
};

// Unpin a message in a chat
export const unpinMessage = async ({
  chatId,
  messageId,
}: {
  chatId: string;
  messageId: string;
}): Promise<ChatType> => {
  try {
    const response = await api.delete<ApiResponse<ChatType>>(
      `/chats/${chatId}/pin/${messageId}`,
    );
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error unpinning message:", error);
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
}: {
  chatId: string;
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
  try {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());
    if (before) params.append("before", before);
    if (after) params.append("after", after);

    const queryString = params.toString();
    const url = queryString
      ? `/messages/${chatId}?${queryString}`
      : `/messages/${chatId}`;

    const response = await api.get<
      ApiResponse<{
        messages: MessageType[];
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
      }>
    >(url, {
      withCredentials: true,
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return handleApiError(error);
  }
};

export const sendMessage = async ({
  chatId,
  content,
  attachments,
  replyToId,
  tempId,
}: {
  chatId: string;
  content: string;
  attachments?: File[];
  replyToId?: string;
  tempId?: string;
}) => {
  try {
    const formData = new FormData();
    formData.append("content", content);
    if (replyToId) formData.append("replyToId", replyToId);
    if (tempId) formData.append("tempId", tempId);
    if (attachments) {
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    const response = await api.post<ApiResponse<MessageType>>(
      `/messages/${chatId}`,
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error sending message:", error);
    return handleApiError(error);
  }
};

export const deleteMessage = async ({
  chatId,
  messageId,
  forEveryone,
}: {
  chatId: string;
  messageId: string;
  forEveryone?: boolean;
}) => {
  try {
    if (forEveryone) {
      const response = await api.delete<ApiResponse<MessageType>>(
        `/messages/${chatId}/${messageId}`,
        { withCredentials: true },
      );
      return handleApiResponse(response);
    } else {
      const response = await api.delete<ApiResponse<MessageType>>(
        `/messages/${chatId}/${messageId}/me`,
        { withCredentials: true },
      );
      return handleApiResponse(response);
    }
  } catch (error) {
    console.error("Error deleting message:", error);
    return handleApiError(error);
  }
};

export const updateReaction = async ({
  chatId,
  messageId,
  emoji,
}: {
  chatId: string;
  messageId: string;
  emoji: string;
}): Promise<MessageType> => {
  try {
    const response = await api.patch<ApiResponse<MessageType>>(
      `/messages/${chatId}/${messageId}/reaction`,
      { emoji },
    );
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error updating reaction:", error);
    return handleApiError(error);
  }
};

// Edit a message
export const editMessage = async ({
  chatId,
  messageId,
  content,
  replyToId,
}: {
  chatId: string;
  messageId: string;
  content: string;
  replyToId?: string;
}) => {
  try {
    console.log(chatId, messageId, content, replyToId);
    const response = await api.patch<ApiResponse<MessageType>>(
      `/messages/${chatId}/${messageId}/edit`,
      { content, replyToId },
    );
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error editing message:", error);
    return handleApiError(error);
  }
};

// Mark messages as read with improved error handling
export const markMessagesAsRead = async ({
  chatId,
  messageIds,
}: {
  chatId: string;
  messageIds?: string[];
}) => {
  try {
    const response = await api.post<ApiResponse<MessageType[]>>(
      `/messages/${chatId}/read`,
      { messageIds },
    );
    return handleApiResponse(response);
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return handleApiError(error);
  }
};
