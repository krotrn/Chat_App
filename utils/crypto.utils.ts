"use server";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY is not defined in environment variables.");
}

const IV_LENGTH = 16;

/**
 * Convert a base64 string to a Uint8Array
 */
const base64ToUint8Array = (base64: string): Uint8Array => {
  return new Uint8Array(Buffer.from(base64, "base64"));
};

/**
 * Convert a Uint8Array to a base64 string
 */
const uint8ArrayToBase64 = (array: Uint8Array): string => {
  return Buffer.from(array).toString("base64");
};

/**
 * Derive a crypto key from the environment key
 */
const getCryptoKey = async (): Promise<CryptoKey> => {
  const keyBuffer = new TextEncoder().encode(ENCRYPTION_KEY);
  return await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-CBC" },
    false,
    ["encrypt", "decrypt"]
  );
};

/**
 * Encrypts a token using AES-CBC encryption (Edge Runtime compatible).
 */
export const encryptToken = async (text: string): Promise<string> => {
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encodedText = new TextEncoder().encode(text);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    key,
    encodedText
  );

  return `${uint8ArrayToBase64(iv)}:${uint8ArrayToBase64(new Uint8Array(encrypted))}`;
};

/**
 * Decrypts an AES-CBC encrypted token (Edge Runtime compatible).
 */
export const decryptToken = async (text: string): Promise<string> => {
  const key = await getCryptoKey();
  const [iv, encrypted] = text.split(":");

  if (!iv || !encrypted) {
    throw new Error("Invalid encrypted token format.");
  }

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv: base64ToUint8Array(iv) },
    key,
    base64ToUint8Array(encrypted)
  );

  return new TextDecoder().decode(decrypted);
};
