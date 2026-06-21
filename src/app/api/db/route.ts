import { NextResponse } from "next/server";
import { readDbFile, writeDbFile } from "@/lib/db-server";
import { normalizeDb } from "@/lib/db";
import type { DbV1 } from "@/lib/types";

export async function GET() {
  try {
    const db = await readDbFile();
    return NextResponse.json(db);
  } catch {
    return NextResponse.json(
      { error: "Nu s-a putut citi fișierul de date." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const db = normalizeDb(body) as DbV1;
    await writeDbFile(db);
    return NextResponse.json(db);
  } catch {
    return NextResponse.json(
      { error: "Nu s-a putut salva fișierul de date." },
      { status: 500 },
    );
  }
}
