import { getUserDataById } from "@/actions/userUtils";
import { FormattedFriendRequest } from "@/types/formattedDataTypes";
import { FriendRequest } from "@prisma/client";

export const formatRequests = async (
  unFormattedData: FriendRequest[]
): Promise<FormattedFriendRequest[]> => {
  const formattedDataPromises = unFormattedData.map(async (req) => {
    const { senderId } = req;
    const data = await getUserDataById(senderId, [
      "avatarUrl",
      "name",
      "username",
      "createdAt",
    ]);

    if (!data) {
      return {
        ...req,
        senderAvatar: null,
        senderName: null,
        senderUsername: null,
        requestCreatedAt: null,
      } as FormattedFriendRequest;
    }

    const { avatarUrl, name, username, createdAt } = data;
    return {
      ...req,
      senderAvatar: avatarUrl,
      senderName: name,
      senderUsername: username,
      requestCreatedAt: createdAt,
    } as FormattedFriendRequest;
  });

  return await Promise.all(formattedDataPromises);
};
