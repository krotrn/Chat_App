import { EmailVerification } from "@/components";
import { db } from "@/prisma";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { redirect } from "next/navigation";
export const runtime = "nodejs";

export async function generateStaticParams() {
  return [];
}

export default async function Page({
  params,
}: {
  params: Promise<{ encodedEmail: string }>;
}) {
  const { encodedEmail } = await params;
  const email = decodeURIComponent(encodedEmail);

  if (!email) redirect("/login");

  const user = await db.user.findUnique({
    where: { email },
    select: { emailVerified: true },
  });

  if (!user) redirect("/register");
  if (user.emailVerified) redirect(DEFAULT_LOGIN_REDIRECT);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <EmailVerification email={email} />
    </div>
  );
}
