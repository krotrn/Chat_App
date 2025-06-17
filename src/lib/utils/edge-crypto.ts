import { pbkdf2 } from "@noble/hashes/pbkdf2";
import { sha256 } from "@noble/hashes/sha2";
import { JWTPayload, SignJWT, jwtVerify } from "jose";

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = pbkdf2(sha256, password, salt, { c: 100000, dkLen: 32 });

  const combined = new Uint8Array(salt.length + hash.length);
  combined.set(salt);
  combined.set(hash, salt.length);

  return btoa(String.fromCharCode(...combined));
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    const combined = new Uint8Array(
      atob(hash)
        .split("")
        .map((c) => c.charCodeAt(0)),
    );

    const salt = combined.slice(0, 16);
    const storedHash = combined.slice(16);

    const newHash = pbkdf2(sha256, password, salt, { c: 100000, dkLen: 32 });

    return timingSafeEqual(storedHash, newHash);
  } catch {
    return false;
  }
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }

  return result === 0;
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}
