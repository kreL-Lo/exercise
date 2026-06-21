import type { DbV1 } from "@/lib/types";
import { normalizeSessionEntry } from "@/lib/sessionSteps";

export function emptyDb(): DbV1 {
  return { version: 1, exercises: [], programs: [], sessions: [] };
}

export function normalizeDb(raw: unknown): DbV1 {
  const parsed = raw as Partial<DbV1> | null;
  if (!parsed || parsed.version !== 1) return emptyDb();

  return {
    version: 1,
    exercises: Array.isArray(parsed.exercises)
      ? (parsed.exercises as DbV1["exercises"])
      : [],
    programs: Array.isArray(parsed.programs)
      ? (parsed.programs as DbV1["programs"])
      : [],
    sessions: Array.isArray(parsed.sessions)
      ? (parsed.sessions as Record<string, unknown>[]).map((s) => ({
          ...s,
          entries: Array.isArray(s.entries)
            ? (s.entries as Record<string, unknown>[]).map(normalizeSessionEntry)
            : [],
        })) as DbV1["sessions"]
      : [],
  };
}
