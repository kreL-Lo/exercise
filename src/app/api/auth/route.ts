import { NextResponse } from "next/server";
import { AUTH_COOKIE, createSessionToken, isAccessKeyConfigured } from "@/lib/auth";

export async function POST(request: Request) {
  if (!isAccessKeyConfigured()) {
    return NextResponse.json(
      { error: "APP_ACCESS_KEY nu este configurată pe server." },
      { status: 503 },
    );
  }

  const accessKey = process.env.APP_ACCESS_KEY!;
  let body: { key?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  if (!body.key || body.key !== accessKey) {
    return NextResponse.json({ error: "Cheie de acces invalidă." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, await createSessionToken(accessKey), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
