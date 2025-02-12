import { ApiError } from "@/lib/api/ApiError";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";
import { generateVerificationToken } from "@/utils/token.utils";

export const sendEmail = async (email: string) => {
  const verificationToken = await generateVerificationToken(email);
  if (!verificationToken)
    throw new ApiError({
      statusCode: 500,
      message: "Error Generating Verification Token.",
    });

  return await sendVerificationEmail(email, verificationToken);
};
