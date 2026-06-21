"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Card, FieldGroup, Label } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Autentificare eșuată.");
        return;
      }

      router.push(from);
      router.refresh();
    } catch {
      setError("Nu s-a putut contacta serverul.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-1 sm:min-h-[70vh]">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold gradient-text">Exercise Tracker</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Introdu cheia de acces pentru a continua.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <FieldGroup>
            <Label htmlFor="access-key">Cheie de acces</Label>
            <input
              id="access-key"
              type="password"
              autoComplete="current-password"
              className="input-dark"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="APP_ACCESS_KEY"
              required
            />
          </FieldGroup>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button type="submit" className="btn-gradient w-full" disabled={loading}>
            {loading ? "Se verifică..." : "Intră în aplicație"}
          </button>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center text-[var(--muted)]">
          Se încarcă...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
