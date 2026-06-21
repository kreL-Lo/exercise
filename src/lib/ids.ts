export function newId(): string {
  // Browser + modern Node support (Next.js)
  return crypto.randomUUID();
}

