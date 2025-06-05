import { updateProfile } from "@/actions/userUtils";
import { useMutation } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "../useReduxType";
import { setUser } from "@/lib/redux/slices/user-slice";

export const useProfileUpdateMutation = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  if (!user) {
    throw new Error("User is not defined");
  }

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      console.log(user);
      console.log(data);
      dispatch(
        setUser({
          id: user.id,
          name: data.data?.name,
          bio: data.data?.bio,
          avatarUrl: data.data?.avatarUrl || user.avatarUrl,
          role: user.role,
          email: user.email,
          username: user.username,
        }),
      );
      console.log("Profile updated successfully:", data);
      console.log(user);
    },
  });
};
