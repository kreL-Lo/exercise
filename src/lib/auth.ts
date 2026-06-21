import { createHash, timingSafeEqual } from "crypto";

export const AUTH_COOKIE = "exercise-tracker-auth";

export function createSessionToken(accessKey: string): string {
  return createHash("sha256")
    .update(`${accessKey}:exercise-tracker`)
    .digest("hex");
}

export function isValidSessionToken(
  accessKey: string,
  token: string | undefined,
): boolean {
  if (!token) return false;
  const expected = createSessionToken(accessKey);
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function isAccessKeyConfigured(): boolean {
  return Boolean(process.env.APP_ACCESS_KEY);
}
