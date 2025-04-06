import axios from "axios";
import { config } from "@/config";
import { ChatType, MessageType, ParticipantsType } from "@/types/ChatType";

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

const api = axios.create({
  baseURL: `${config.chatApiUrl}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error.response?.data || error.message);
  }
);

export const setAuthToken = (token: string) => {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

// Fetch all chats
export const fetchChats = async (): Promise<ChatType[]> => {
  try {
    const response = await api.get<ApiResponse<ChatType[]>>("/chats", {
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    throw error;
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
    const response = await api.post<ApiResponse<ChatType>>(
      "/chats/chat",
      { participants, name },
      { withCredentials: true }
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    throw error;
  }
};

// Get chat By id
export const getChatById = async ({
  chatId,
}: {
  chatId: string;
}): Promise<ChatType> => {
  try {
    const response = await api.get<ApiResponse<ChatType>>(`/chats/chat/${chatId}`, {
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    throw error;
  }
};

// Delete a one-on-one chat
export const deleteOneOnOneChat = async ({
  chatId,
}: {
  chatId: string;
}): Promise<ApiResponse<null>> => {
  try {
    const response = await api.delete<ApiResponse<null>>(
      `/chats/chat/${chatId}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    throw error;
  }
};

// Delete a chat for the current user
export const deleteChatForMe = async ({
  chatId,
}: {
  chatId: string;
}): Promise<ApiResponse<null>> => {
  try {
    const response = await api.delete<ApiResponse<null>>(
      `/chats/chat/${chatId}/me`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    throw error;
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
    const response = await api.post<ApiResponse<ChatType>>(
      "/chats/group",
      { participants, name },
      { withCredentials: true }
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    throw error;
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
      { withCredentials: true }
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    throw error;
  }
};

// Rename a group chat
export const renameGroupChat = async ({
  chatId,
  name,
}: {
  chatId: string;
  name: string;
}): Promise<ChatType> => {
  try {
    const response = await api.patch<ApiResponse<ChatType>>(
      `/chats/group/${chatId}`,
      { name },
      { withCredentials: true }
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    throw error;
  }
};

// Delete a group chat
export const deleteGroupChat = async ({
  chatId,
}: {
  chatId: string;
}): Promise<ChatType> => {
  try {
    const response = await api.delete<ApiResponse<ChatType>>(
      `/chats/group/${chatId}`,
      { withCredentials: true }
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    throw error;
  }
};

// Add a new participant to a group chat
export const addNewParticipantInGroupChat = async ({
  chatId,
  participantId,
}: {
  chatId: string;
  participantId: string;
}): Promise<ChatType> => {
  try {
    const response = await api.post<ApiResponse<ChatType>>(
      `/chats/group/${chatId}/participant/${participantId}`,
      {},
      { withCredentials: true }
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    throw error;
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
      { withCredentials: true }
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    throw error;
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
      { withCredentials: true }
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    throw error;
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
      `/chats/chat/${chatId}/pin/${messageId}`,
      {},
      { withCredentials: true }
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    throw error;
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
      `/chats/chat/${chatId}/pin/${messageId}`,
      { withCredentials: true }
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    throw error;
  }
};

export const getAllMessages = async ({ chatId }: { chatId: string }) => {
  try {
    const response = await api.get<ApiResponse<MessageType>>(
      `/messages/${chatId}`,
      { withCredentials: true }
    );

    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    throw error;
  }
};

export const sendMessage = async ({
  chatId,
  content,
  attachments,
  replyToId,
}: {
  chatId: string;
  content: string;
  attachments?: File[];
  replyToId?: string;
}) => {
  try {
    const formData = new FormData();
    formData.append("content", content);
    if (replyToId) formData.append("replyToId", replyToId);
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
      }
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    throw error;
  }
};

export const deleteMessage = async ({
  chatId,
  messageId,
}: {
  chatId: string;
  messageId: string;
}) => {
  try {
    const response = await api.delete<ApiResponse<MessageType>>(
      `/messages/${chatId}/${messageId}`,
      { withCredentials: true }
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    throw error;
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
}) => {
  try {
    const response = await api.post<ApiResponse<MessageType>>(
      `/messages/${chatId}/${messageId}/reaction`,
      { emoji },
      { withCredentials: true }
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    throw error;
  }
};

export const replyMessage = async ({
  chatId,
  messageId,
  content,
  attachments,
}: {
  chatId: string;
  messageId: string;
  content: string;
  attachments?: File[];
}) => {
  try {
    const formData = new FormData();
    formData.append("content", content);
    if (attachments) {
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    const response = await api.post<ApiResponse<MessageType>>(
      `/messages/${chatId}/${messageId}/reply`,
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    throw error;
  }
};
