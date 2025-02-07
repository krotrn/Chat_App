import { signout } from "@/actions/signout";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

const page = async () => {
  const session = await auth();
  return <div>{JSON.stringify(session)}
    <form action={signout}>
      <Button>SignOut</Button>
    </form>
  </div>;
};

export default page;
