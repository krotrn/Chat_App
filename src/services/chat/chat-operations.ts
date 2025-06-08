import {
  api,
  handleApiResponse,
  handleApiError,
  withConnectionCheck,
} from "../api-client";
import { ApiResponse, ChatType } from "@/types";

// Fetch all chats
export const fetchChats = async (
  token: string,
  limit?: number,
  page: number = 1,
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
    return await withConnectionCheck(async () => {
      const response = await api.get<
        ApiResponse<{
          chats: ChatType[];
          pagination: {
            total: number;
            page: number;
            limit: number;
            hasMore: boolean;
          };
        }>
      >(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const responseData = handleApiResponse(response);

      return {
        chats: responseData.chats,
        totals: responseData.pagination.total,
        page: responseData.pagination.page,
        limit: responseData.pagination.limit,
        hasMore: responseData.pagination.hasMore,
      };
    });
  } catch (error) {
    return handleApiError(error);
  }
};

// Get chat By id
export const getChatById = async ({
  chatId,
  token,
}: {
  chatId: string;
  token: string;
}): Promise<ChatType> => {
  try {
    return await withConnectionCheck(async () => {
      const response = await api.get<ApiResponse<ChatType>>(
        `/chats/chat/${chatId}`,
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
