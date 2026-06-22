import { get, put } from "@vercel/blob";
import { emptyDb, normalizeDb } from "@/lib/db";
import type { DbV1 } from "@/lib/types";

const BLOB_PATHNAME = "exercise-tracker/track.json";

function isBlobNotFound(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { name?: string; message?: string };
  return (
    e.name === "BlobNotFoundError" ||
    e.message?.toLowerCase().includes("not found") === true ||
    e.message?.toLowerCase().includes("does not exist") === true
  );
}

async function readStreamAsText(
  stream: ReadableStream<Uint8Array>,
): Promise<string> {
  return new Response(stream).text();
}

export async function readDbFromBlob(): Promise<DbV1> {
  try {
    const result = await get(BLOB_PATHNAME, { access: "private" });

    if (!result || result.statusCode !== 200 || !result.stream) {
      throw new Error("Blob not found or empty");
    }

    const raw = await readStreamAsText(result.stream);
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
