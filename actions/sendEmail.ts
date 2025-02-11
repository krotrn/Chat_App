import { ApiError } from "@/lib/api/ApiError";
import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/utils/token.utils";

export const sendEmail = async (email: string) => {
  const verificationToken = await generateVerificationToken(email);
  if (!verificationToken)
    throw new ApiError({
      statusCode: 500,
      message: "Error Generating Verification Token.",
    });

  const { success, error } = await sendVerificationEmail(
    email,
    verificationToken
  );
  return success ? { success: "Check the confirmation email." } : { error };
};
