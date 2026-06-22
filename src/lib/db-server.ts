import { readDbFromBlob, writeDbToBlob } from "@/lib/db-blob";
import { readDbFromFile, writeDbToFile } from "@/lib/db-file";
import type { DbV1 } from "@/lib/types";

export type DbStorageBackend = "blob" | "file";

/** Blob via token (local) sau OIDC (Vercel: BLOB_STORE_ID + VERCEL_OIDC_TOKEN). */
export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export function getDbStorageBackend(): DbStorageBackend {
  if (isBlobConfigured()) {
    return "blob";
  }
  if (process.env.VERCEL) {
    return "blob";
  }
  return "file";
}

export function getDbStorageErrorHint(): string | null {
  if (process.env.VERCEL && !isBlobConfigured()) {
    return "Conectează un Blob store: Vercel → Storage → Blob → Connect la proiect.";
  }
  return null;
}

export async function readDb(): Promise<DbV1> {
  if (getDbStorageBackend() === "blob") {
    if (!isBlobConfigured()) {
      throw new Error("Blob storage not configured");
    }
    return readDbFromBlob();
  }
  return readDbFromFile();
}

export async function writeDb(db: DbV1): Promise<void> {
  if (getDbStorageBackend() === "blob") {
    if (!isBlobConfigured()) {
      throw new Error("Blob storage not configured");
    }
    await writeDbToBlob(db);
    return;
  }
  await writeDbToFile(db);
}

/** @deprecated use readDb */
export const readDbFile = readDb;

/** @deprecated use writeDb */
export const writeDbFile = writeDb;
