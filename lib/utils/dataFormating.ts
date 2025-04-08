import { getUserDataById } from "@/actions/userUtils";
import { FormattedFriendRequestType } from "@/types/formattedDataTypes";
import { FriendRequest } from "@prisma/client";

export const formatRequests = async (
  unFormattedData: FriendRequest[]
): Promise<FormattedFriendRequestType[]> => {
try {
    const formattedDataPromises = unFormattedData.map(async (req) => {
      const { senderId } = req;
      const data = await getUserDataById(senderId, {
        avatarUrl: true,
        name: true,
        username: true,
        createdAt: true,
      });
  
      if (!data) {
        throw new Error("data not found");
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
  
    return result.filter((req) => req !== null);
} catch {
  throw new Error("Error while getting friends Data.")
}
};
