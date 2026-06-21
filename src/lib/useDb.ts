"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { emptyDb } from "@/lib/db";
import type { DbV1 } from "@/lib/types";

async function fetchDb(): Promise<DbV1> {
  const res = await fetch("/api/db", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load database");
  return res.json() as Promise<DbV1>;
}

async function persistDb(db: DbV1): Promise<DbV1> {
  const res = await fetch("/api/db", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(db),
  });
  if (!res.ok) throw new Error("Failed to save database");
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
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchDb()
      .then((data) => {
        if (!cancelled) setDb(data);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Nu s-au putut încărca datele din fișierul JSON.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback((fn: (prev: DbV1) => DbV1) => {
    const next = fn(dbRef.current);
    dbRef.current = next;
    setDb(next);
    setError(null);

    void persistDb(next).catch(async () => {
      setError("Nu s-au putut salva datele. Se reîncarcă...");
      try {
        await refresh();
      } catch {
        setError("Eroare la salvare și reîncărcare.");
      }
    });
  }, [refresh]);

  return useMemo(
    () => ({ db, update, loading, error, refresh }),
    [db, update, loading, error, refresh],
  );
}
