import crypto from "crypto";

const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update(process.env.ENCRYPTION_KEY || "")
  .digest();
const IV_LENGTH = 16;

export const encryptToken = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

export const decryptToken = (text: string): string => {
  const [iv, encrypted] = text.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    Buffer.from(iv!, "hex")
  );
  let decrypted = decipher.update(Buffer.from(encrypted!, "hex"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};
