import { handlers } from "@/auth"; // Referring to the auth.ts we just created
export const dynamic = "force-static";

export function generateStaticParams() {
  return [];
}

export const { GET, POST } = handlers;
