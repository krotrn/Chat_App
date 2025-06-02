import {
  api,
  handleApiResponse,
  handleApiError,
  withConnectionCheck,
} from "../api-client";
import { ApiResponse, ChatType, ParticipantsType } from "@/types/ChatType";

// Create a group chat
export const createAGroupChat = async ({
  participants,
  name,
  token,
}: {
  name: string;
  participants: ParticipantsType[];
  token: string;
}): Promise<ChatType> => {
  try {
    return await withConnectionCheck(async () => {
      const response = await api.post<ApiResponse<ChatType>>(
        "/chats/group",
        {
          participants,
          name,
        },
        {
          headers: {
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

// Get group chat details
export const getGroupChatDetails = async ({
  chatId,
  token,
}: {
  chatId: string;
  token: string;
}): Promise<ChatType> => {
  try {
    return await withConnectionCheck(async () => {
      const response = await api.get<ApiResponse<ChatType>>(
        `/chats/group/${chatId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return handleApiResponse(response);
    });
  } catch (error) {
    return handleApiError(error);
  }
};

// Rename a group chat
export const updateGroupChat = async ({
  chatId,
  name,
  avatarUrl,
  token,
}: {
  chatId: string;
  name: string;
  avatarUrl: string;
  token: string;
}): Promise<ChatType> => {
  try {
    return await withConnectionCheck(async () => {
      const response = await api.patch<ApiResponse<ChatType>>(
        `/chats/group/${chatId}`,
        { name, avatarUrl },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return handleApiResponse(response);
    });
  } catch (error) {
    return handleApiError(error);
  }
};

// Delete a group chat
export const deleteGroupChat = async ({
  chatId,
  token,
}: {
  chatId: string;
  token: string;
}): Promise<null> => {
  try {
    return await withConnectionCheck(async () => {
      const response = await api.delete<ApiResponse<null>>(
        `/chats/group/${chatId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return handleApiResponse(response);
    });
  } catch (error) {
    return handleApiError(error);
  }
};

// Add a new participant to a group chat
export const addNewParticipantInGroupChat = async ({
  chatId,
  participants,
  token,
}: {
  chatId: string;
  participants: ParticipantsType[];
  token: string;
}): Promise<ChatType> => {
  try {
    return await withConnectionCheck(async () => {
      const response = await api.post<ApiResponse<ChatType>>(
        `/chats/group/${chatId}/participant`,
        { participants },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return handleApiResponse(response);
    });
  } catch (error) {
    return handleApiError(error);
  }
};

// Remove a participant from a group chat
export const removeParticipantFromGroupChat = async ({
  chatId,
  participantId,
  token,
}: {
  chatId: string;
  participantId: string;
  token: string;
}): Promise<ChatType> => {
  try {
    return await withConnectionCheck(async () => {
      const response = await api.delete<ApiResponse<ChatType>>(
        `/chats/group/${chatId}/participant/${participantId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return handleApiResponse(response);
    });
  } catch (error) {
    return handleApiError(error);
  }
};

// Leave a group chat
export const leaveGroupChat = async ({
  chatId,
  token,
}: {
  chatId: string;
  token: string;
}): Promise<ChatType> => {
  try {
    return await withConnectionCheck(async () => {
      const response = await api.delete<ApiResponse<ChatType>>(
        `/chats/group/${chatId}/leave`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return handleApiResponse(response);
    });
  } catch (error) {
    return handleApiError(error);
  }
};
