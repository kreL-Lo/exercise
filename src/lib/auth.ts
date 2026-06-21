export const AUTH_COOKIE = "exercise-tracker-auth";

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken(accessKey: string): Promise<string> {
  return sha256Hex(`${accessKey}:exercise-tracker`);
}

export async function isValidSessionToken(
  accessKey: string,
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  const expected = await createSessionToken(accessKey);
  if (token.length !== expected.length) return false;

  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export function isAccessKeyConfigured(): boolean {
  return Boolean(process.env.APP_ACCESS_KEY);
}
