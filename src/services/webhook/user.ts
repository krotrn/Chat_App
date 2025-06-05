import { ApiResponse } from "@/types/ChatType";
import {
  api,
  handleApiError,
  handleApiResponse,
  withConnectionCheck,
} from "../api-client";

export const updateUserWebhook = async (
  token: string,
  data: { name: string; avatarUrl: string | null },
) => {
  try {
    return await withConnectionCheck(async () => {
      const response = await api.put<ApiResponse<null>>(`/webhook/user`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return handleApiResponse(response);
    });
  } catch (error) {
    handleApiError(error);
  }
};

export const deleteUserWebhook = async (token: string) => {
  try {
    return await withConnectionCheck(async () => {
      const response = await api.delete<ApiResponse<null>>(`/webhook/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return handleApiResponse(response);
    });
  } catch (error) {
    handleApiError(error);
  }
};
