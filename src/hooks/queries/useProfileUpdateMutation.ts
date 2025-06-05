import { updateProfile } from "@/actions/userUtils";
import { useMutation } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "../useReduxType";
import { setUser } from "@/lib/redux/slices/user-slice";

export const useProfileUpdateMutation = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      dispatch(
        setUser({
          id: user?.id,
          name: data.data?.name,
          bio: data.data?.bio,
          avatarUrl: data.data?.avatarUrl || user?.avatarUrl || "",
          role: user?.role || "user",
          email: user?.email,
          username: user?.username || "",
        }),
      );
    },
  });
};
