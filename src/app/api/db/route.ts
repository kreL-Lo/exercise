import { NextResponse } from "next/server";
import { normalizeDb } from "@/lib/db";
import {
  getDbStorageErrorHint,
  readDb,
  writeDb,
} from "@/lib/db-server";
import type { DbV1 } from "@/lib/types";

function dbErrorResponse(action: "read" | "write", error: unknown) {
  console.error(`DB ${action} error:`, error);

  const hint = getDbStorageErrorHint();
  if (hint) {
    return NextResponse.json({ error: hint }, { status: 503 });
  }

  return NextResponse.json(
    {
      error:
        action === "read"
          ? "Nu s-a putut citi fișierul de date."
          : "Nu s-a putut salva fișierul de date.",
    },
    { status: 500 },
  );
}

export async function GET() {
  try {
    const db = await readDb();
    return NextResponse.json(db);
  } catch (error) {
    return dbErrorResponse("read", error);
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const db = normalizeDb(body) as DbV1;
    await writeDb(db);
    return NextResponse.json(db);
  } catch (error) {
    return dbErrorResponse("write", error);
  }
}
