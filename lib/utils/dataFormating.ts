import { getUserDataById } from "@/actions/userUtils";
import { FormattedFriendRequest } from "@/types/formattedDataTypes";
import { FriendRequest } from "@prisma/client";

export const formatRequests = async (
  unFormattedData: FriendRequest[] | null
): Promise<FormattedFriendRequest[] | null> => {
  if (!unFormattedData) return null;
  const formattedDataPromises = unFormattedData.map(async (req) => {
    const { senderId } = req;
    const data = await getUserDataById(senderId, [
      "avatarUrl",
      "name",
      "username",
      "createdAt",
    ]);

    if (!data) {
      return null;
    }

    const { avatarUrl, name, username, createdAt } = data;
    return {
      ...req,
      senderAvatar: avatarUrl,
      senderName: name,
      senderUsername: username,
      requestCreatedAt: createdAt,
    };
  });

  const result = await Promise.all(formattedDataPromises);

  return result.filter((req) => req!== null);
};
