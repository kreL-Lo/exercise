import type { DbV1 } from "@/lib/types";
import { normalizeSessionEntry } from "@/lib/sessionSteps";

const STORAGE_KEY = "exercise-tracker-db";

function emptyDb(): DbV1 {
  return { version: 1, exercises: [], programs: [], sessions: [] };
}

export function loadDb(): DbV1 {
  if (typeof window === "undefined") return emptyDb();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyDb();
  try {
    const parsed = JSON.parse(raw) as Partial<DbV1> | null;
    if (!parsed || parsed.version !== 1) return emptyDb();
    return {
      version: 1,
      exercises: Array.isArray(parsed.exercises) ? (parsed.exercises as DbV1["exercises"]) : [],
      programs: Array.isArray(parsed.programs) ? (parsed.programs as DbV1["programs"]) : [],
      sessions: Array.isArray(parsed.sessions)
        ? (parsed.sessions as Record<string, unknown>[]).map((s) => ({
            ...s,
            entries: Array.isArray(s.entries)
              ? (s.entries as Record<string, unknown>[]).map(normalizeSessionEntry)
              : [],
          })) as DbV1["sessions"]
        : [],
    };
  } catch {
    return emptyDb();
  }
}

export function saveDb(next: DbV1) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  // Notify same-tab listeners
  window.dispatchEvent(new Event("exercise-tracker-db"));
}

export function subscribeDb(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  const onCustom = () => cb();
  window.addEventListener("storage", onStorage);
  window.addEventListener("exercise-tracker-db", onCustom as EventListener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("exercise-tracker-db", onCustom as EventListener);
  };
}

