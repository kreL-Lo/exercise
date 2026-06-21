import type { Session, SessionEntry } from "@/lib/types";

export type SetStep = {
  entryIndex: number;
  setIndex: number;
  exerciseId: string;
  setNumber: number;
  totalSetsInExercise: number;
  targetReps: number;
  globalIndex: number;
  globalTotal: number;
};

export function flattenSessionSteps(session: Session): SetStep[] {
  const steps: SetStep[] = [];
  let globalIndex = 0;
  const globalTotal = session.entries.reduce(
    (sum, e) => sum + e.setRecords.length,
    0,
  );

  session.entries.forEach((entry, entryIndex) => {
    entry.setRecords.forEach((record, setIndex) => {
      steps.push({
        entryIndex,
        setIndex,
        exerciseId: entry.exerciseId,
        setNumber: setIndex + 1,
        totalSetsInExercise: entry.setRecords.length,
        targetReps: record.targetReps,
        globalIndex,
        globalTotal,
      });
      globalIndex++;
    });
  });

  return steps;
}

export function entryVolume(entry: SessionEntry): number {
  return entry.setRecords.reduce(
    (sum, record) => sum + record.targetReps + record.delta,
    0,
  );
}

export function entryAvgDuration(entry: SessionEntry): number | null {
  const completed = entry.setRecords.filter(
    (r) => r.durationSeconds !== null,
  );
  if (completed.length === 0) return null;
  const total = completed.reduce((sum, r) => sum + r.durationSeconds!, 0);
  return Math.round(total / completed.length);
}

export function sessionVolume(session: Session): number {
  return session.entries.reduce((sum, entry) => sum + entryVolume(entry), 0);
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) {
    return `${m}:${String(s).padStart(2, "0")}`;
  }
  return `${s}s`;
}

export function createSessionEntries(
  programExercises: { exerciseId: string; sets: number; reps: number }[],
): SessionEntry[] {
  return programExercises.map((pe) => ({
    exerciseId: pe.exerciseId,
    targetSets: pe.sets,
    targetReps: pe.reps,
    setRecords: Array.from({ length: pe.sets }, () => ({
      targetReps: pe.reps,
      delta: 0,
      durationSeconds: null,
    })),
  }));
}

/** Migrează intrări vechi (sets/reps/delta) la format per-set */
export function normalizeSessionEntry(raw: Record<string, unknown>): SessionEntry {
  if (Array.isArray(raw.setRecords) && raw.setRecords.length > 0) {
    const targetReps = (raw.targetReps as number) ?? 10;
    return {
      exerciseId: raw.exerciseId as string,
      targetSets: (raw.targetSets as number) ?? raw.setRecords.length,
      targetReps,
      setRecords: (raw.setRecords as Record<string, unknown>[]).map((r) => ({
        targetReps: (r.targetReps as number) ?? targetReps,
        delta: typeof r.delta === "number" ? r.delta : 0,
        durationSeconds:
          typeof r.durationSeconds === "number" ? r.durationSeconds : null,
      })),
    };
  }

  const targetSets = (raw.targetSets as number) ?? (raw.sets as number) ?? 1;
  const targetReps = (raw.targetReps as number) ?? (raw.reps as number) ?? 10;
  const legacyDelta = typeof raw.delta === "number" ? raw.delta : 0;

  return {
    exerciseId: raw.exerciseId as string,
    targetSets,
    targetReps,
    setRecords: Array.from({ length: targetSets }, (_, i) => ({
      targetReps,
      delta: i === 0 ? legacyDelta : 0,
      durationSeconds: null,
    })),
  };
}
