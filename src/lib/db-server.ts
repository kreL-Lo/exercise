import { readDbFromBlob, writeDbToBlob } from "@/lib/db-blob";
import { readDbFromFile, writeDbToFile } from "@/lib/db-file";
import type { DbV1 } from "@/lib/types";

export type DbStorageBackend = "blob" | "file";

export function getDbStorageBackend(): DbStorageBackend {
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL) {
    return "blob";
  }
  return "file";
}

export function getDbStorageErrorHint(): string | null {
  if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
    return "Pe Vercel trebuie creat un Blob store: Project → Storage → Blob → Connect.";
  }
  return null;
}

export async function readDb(): Promise<DbV1> {
  if (getDbStorageBackend() === "blob") {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("BLOB_READ_WRITE_TOKEN missing");
    }
    return readDbFromBlob();
  }
  return readDbFromFile();
}

export async function writeDb(db: DbV1): Promise<void> {
  if (getDbStorageBackend() === "blob") {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("BLOB_READ_WRITE_TOKEN missing");
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
