import { updateProfile } from "@/actions/user";
import { useMutation } from "@tanstack/react-query";
import { useAppDispatch } from "@/hooks/types/useReduxType";
import { setUser } from "@/lib/redux/slices/user-slice";

export const useProfileUpdateMutation = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      if (!data.data) {
        console.error("Profile update failed: No data returned");
        return;
      }
      dispatch(
        setUser({
          id: data.data.id,
          name: data.data.name,
          bio: data.data.bio || "",
          avatarUrl: data.data.avatarUrl || "",
          role: data.data.role,
          username: data.data.username,
          email: data.data.email,
          status: data.data.status || "",
        }),
      );
    },
  });
};
