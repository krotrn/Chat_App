import EmailVerification from "@/components/auth/EmailVerification";
import { db } from "@/prisma";
import { redirect } from "next/navigation";

/**
 * Page component for verifying user email.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.params - The route parameters.
 * @param {string} props.params.email - The email to be verified.
 *
 * @returns {Promise<React.ReactNode>} The rendered component.
 *
 * This function performs the following:
 * 1. Extracts the email from the route parameters.
 * 2. Redirects to the login page if the email is not provided.
 * 3. Fetches the user from the database based on the provided email.
 * 4. Redirects to the register page if the user is not found.
 * 5. Redirects to the login page if the email is already verified.
 * 6. Renders the EmailVerification component if the email is not verified.
 */
export default async function Page({
  params,
}: {
  params: { Email: string };
}): Promise<React.ReactNode> {
  const { Email } = params;
  const email = decodeURIComponent(Email)
  if (!email) redirect("/login");
  const user = await db.user.findUnique({
    where: { email },
    select: { emailVerified: true },
  });
  if (!user) redirect("/register");
  if (user.emailVerified) redirect("/login");
  return (
    <div className="min-h-screen flex items-center justify-center">
      <EmailVerification email={email} />
    </div>
  );
}
