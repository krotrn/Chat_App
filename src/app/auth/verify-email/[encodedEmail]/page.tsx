import EmailVerification from "@/components/auth/EmailVerification";
import { db } from "@/prisma";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { redirect } from "next/navigation";

export async function generateStaticParams() {
  // For `output: "export"`, Next.js expects this function for dynamic routes.
  // Since email verification links are dynamic and not known at build time,
  // we return an empty array. This means no specific paths for this page
  // will be pre-rendered at build time.
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
