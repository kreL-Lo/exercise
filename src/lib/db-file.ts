import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { emptyDb, normalizeDb } from "@/lib/db";
import type { DbV1 } from "@/lib/types";

function getDbPath(): string {
  const configured = process.env.DATA_FILE_PATH;
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured);
  }
  return path.join(process.cwd(), "data", "track.json");
}

export async function readDbFromFile(): Promise<DbV1> {
  const filePath = getDbPath();

  try {
    const raw = await readFile(filePath, "utf-8");
    return normalizeDb(JSON.parse(raw));
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      const initial = emptyDb();
      await writeDbToFile(initial);
      return initial;
    }
    throw error;
  }
}

export async function writeDbToFile(db: DbV1): Promise<void> {
  const filePath = getDbPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(db, null, 2), "utf-8");
}
