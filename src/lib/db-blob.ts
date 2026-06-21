import { head, put } from "@vercel/blob";
import { emptyDb, normalizeDb } from "@/lib/db";
import type { DbV1 } from "@/lib/types";

const BLOB_PATHNAME = "exercise-tracker/track.json";

function isBlobNotFound(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { name?: string; message?: string };
  return (
    e.name === "BlobNotFoundError" ||
    e.message?.includes("does not exist") === true ||
    e.message?.includes("not found") === true
  );
}

export async function readDbFromBlob(): Promise<DbV1> {
  try {
    const blob = await head(BLOB_PATHNAME);
    const res = await fetch(blob.url);
    if (!res.ok) {
      throw new Error(`Blob fetch failed: ${res.status}`);
    }
    const raw = await res.text();
    return normalizeDb(JSON.parse(raw));
  } catch (error) {
    if (isBlobNotFound(error)) {
      const initial = emptyDb();
      await writeDbToBlob(initial);
      return initial;
    }
    throw error;
  }
}

export async function writeDbToBlob(db: DbV1): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(db, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}
