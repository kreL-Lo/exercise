"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DbV1 } from "@/lib/types";
import { loadDb, saveDb, subscribeDb } from "@/lib/storage";

export function useDb() {
  const [db, setDb] = useState<DbV1>(() => loadDb());

  useEffect(() => {
    return subscribeDb(() => setDb(loadDb()));
  }, []);

  const update = useCallback((fn: (prev: DbV1) => DbV1) => {
    setDb((prev) => {
      const next = fn(prev);
      saveDb(next);
      return next;
    });
  }, []);

  return useMemo(() => ({ db, update }), [db, update]);
}

