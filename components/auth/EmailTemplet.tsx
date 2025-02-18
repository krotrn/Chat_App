import React from "react";

/**
 * EmailVerification component renders an email verification template.
 * It displays an OTP, a verification link, and an expiration notice.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.verificationLink - The link to verify the email address.
 * @param {string} props.expirationHours - The number of hours until the verification link expires.
 * @returns {React.ReactNode} The rendered email verification template.
 */
const EmailTemplet = ({
  verificationLink,
  expirationHours,
}: {
  verificationLink: string;
  expirationHours: string;
}):React.ReactNode => {
  return (
    <div className="font-sans max-w-lg mx-auto p-6 bg-white border border-gray-300 rounded-lg shadow-md">
      <h2 className="text-blue-600 text-center text-2xl font-bold mb-4">
        Verify Your Email Address
      </h2>
      <p className="text-gray-700 text-center text-lg">
        To complete your registration, please verify your email address using
        one of the options below:
      </p>
      {/* Verification Link Section */}
      <p className="text-center text-gray-700 text-lg mt-4">
        click the button below:
      </p>
      <div className="text-center my-4">
        <a
          href={verificationLink}
          className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition"
        >
          Verify Email
        </a>
      </div>
      <p className="text-center text-gray-500 text-sm break-words">
        Or use this link:{" "}
        <a href={verificationLink} className="text-blue-600 break-words">
          {verificationLink}
        </a>
      </p>

      <p className="text-center text-gray-500 text-sm mt-4">
        This verification link will expire in <strong>{expirationHours}</strong>{" "}
        hours.
      </p>

      <hr className="border-gray-300 my-6" />
      <p className="text-center text-gray-400 text-xs">
        If you didn&apos;t request this email, please ignore it. For assistance,
        contact our support team.
      </p>
    </div>
  );
};

export default EmailTemplet;
