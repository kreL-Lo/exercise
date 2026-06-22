"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { emptyDb } from "@/lib/db";
import type { DbV1 } from "@/lib/types";

async function parseApiError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    if (data.error) return data.error;
  } catch {
    // ignore
  }
  if (res.status === 401 || res.status === 403) {
    return "Sesiune expirată. Reautentifică-te.";
  }
  if (res.status === 503) {
    return "Storage neconfigurat pe server (Vercel Blob).";
  }
  return `Eroare server (${res.status}).`;
}

async function fetchDb(): Promise<DbV1> {
  const res = await fetch("/api/db", {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return res.json() as Promise<DbV1>;
}

async function persistDb(db: DbV1): Promise<DbV1> {
  const res = await fetch("/api/db", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(db),
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return res.json() as Promise<DbV1>;
}

export function useDb() {
  const [db, setDb] = useState<DbV1>(emptyDb());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dbRef = useRef(db);
  dbRef.current = db;

  const refresh = useCallback(async () => {
    const data = await fetchDb();
    setDb(data);
    setError(null);
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchDb()
      .then((data) => {
        if (!cancelled) {
          setDb(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : "Nu s-au putut încărca datele.";
          setError(message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback(
    (fn: (prev: DbV1) => DbV1) => {
      const next = fn(dbRef.current);
      dbRef.current = next;
      setDb(next);
      setError(null);

      void persistDb(next).catch(async (err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Nu s-au putut salva datele.";
        setError(`${message} Se reîncarcă...`);
        try {
          await refresh();
        } catch {
          setError(message);
        }
      });
    },
    [refresh],
  );

  return useMemo(
    () => ({ db, update, loading, error, refresh }),
    [db, update, loading, error, refresh],
  );
}
