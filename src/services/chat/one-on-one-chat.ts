import {
  api,
  handleApiResponse,
  handleApiError,
  withConnectionCheck,
} from "../api-client";
import { ApiResponse, ChatType, ParticipantsType } from "@/types/ChatType";

// Create or get a one-on-one chat
export const createOrGetAOneOnOneChat = async ({
  participants,
  name,
  token,
}: {
  participants: ParticipantsType[];
  name: string;
  token: string;
}): Promise<ChatType> => {
  try {
    return await withConnectionCheck(async () => {
      const response = await api.post<ApiResponse<ChatType>>(
        "/chats",
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

// Delete a one-on-one chat
export const deleteOneOnOneChat = async ({
  chatId,
  forEveryone,
  token,
}: {
  chatId: string;
  forEveryone?: boolean;
  token: string;
}): Promise<null> => {
  try {
    return await withConnectionCheck(async () => {
      if (forEveryone) {
        const response = await api.delete<ApiResponse<null>>(
          `/chats/chat/${chatId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        return handleApiResponse(response);
      } else {
        const response = await api.delete<ApiResponse<null>>(
          `/chats/${chatId}/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        return handleApiResponse(response);
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
};
