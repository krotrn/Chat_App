import { User } from "next-auth";
import RefreshPage from "@/components/RefreshPage";

interface AuthorizedProps {
  children: React.ReactNode;
  user?: User;
}

export default function Authorized({ children, user }: AuthorizedProps) {
  if (user) return <>{children}</>;
  return <RefreshPage />;
}
