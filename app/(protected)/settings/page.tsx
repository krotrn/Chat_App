import { signout } from "@/actions/signout";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

const page = async () => {
  const session = await auth();
  return (
    <div className="flex h-screen items-center justify-center">
      {JSON.stringify(session)}
      <form action={signout}>
        <Button>SignOut</Button>
      </form>
    </div>
  );
};

export default page;
