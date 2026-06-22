import type { DbV1, Exercise, ExerciseType } from "@/lib/types";
import { normalizeSessionEntry } from "@/lib/sessionSteps";

export function emptyDb(): DbV1 {
  return { version: 1, exercises: [], programs: [], sessions: [] };
}

export function normalizeExercise(raw: Record<string, unknown>): Exercise {
  const type: ExerciseType =
    raw.type === "weight" || raw.type === "bodyweight" ? raw.type : "bodyweight";
  const weightKg =
    type === "weight" && typeof raw.weightKg === "number" && raw.weightKg > 0
      ? raw.weightKg
      : null;

  return {
    id: raw.id as string,
    name: (raw.name as string) ?? "",
    type,
    weightKg,
    defaultSets: (raw.defaultSets as number) ?? 3,
    defaultReps: (raw.defaultReps as number) ?? 10,
    createdAt: (raw.createdAt as string) ?? new Date().toISOString(),
  };
}

export function normalizeDb(raw: unknown): DbV1 {
  const parsed = raw as Partial<DbV1> | null;
  if (!parsed || parsed.version !== 1) return emptyDb();

  return {
    version: 1,
    exercises: Array.isArray(parsed.exercises)
      ? (parsed.exercises as Record<string, unknown>[]).map(normalizeExercise)
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
