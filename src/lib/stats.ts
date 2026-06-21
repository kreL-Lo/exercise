import type { Program, Session } from "@/lib/types";
import { entryVolume } from "@/lib/sessionSteps";

export type WeightGranularity = "day" | "week" | "month";

export type SessionMetrics = {
  sessionId: string;
  date: string;
  label: string;
  avgSets: number;
  avgReps: number;
  totalVolume: number;
  programId: string;
  programName: string;
};

export type WeightPoint = {
  key: string;
  label: string;
  weightKg: number;
};

function toLocalDateKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "short",
  });
}

function weekKey(iso: string): string {
  const d = new Date(iso);
  const day = d.getDay() || 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day + 1);
  return toLocalDateKey(d.toISOString());
}

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function getCompletedSessions(sessions: Session[]): Session[] {
  return sessions
    .filter((s) => s.endAt !== null)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}

export function computeStreak(sessions: Session[]): number {
  const dates = new Set(
    getCompletedSessions(sessions).map((s) => toLocalDateKey(s.startAt)),
  );
  if (dates.size === 0) return 0;

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  const todayKey = toLocalDateKey(cursor.toISOString());
  const yesterday = new Date(cursor);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toLocalDateKey(yesterday.toISOString());

  if (!dates.has(todayKey) && !dates.has(yesterdayKey)) return 0;

  if (!dates.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (dates.has(toLocalDateKey(cursor.toISOString()))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getSessionMetrics(
  sessions: Session[],
  programs: Program[],
  programFilter: string | "all",
): SessionMetrics[] {
  const programMap = new Map(programs.map((p) => [p.id, p]));

  return getCompletedSessions(sessions)
    .filter((s) => programFilter === "all" || s.programId === programFilter)
    .map((s) => {
      const program = programMap.get(s.programId);
      const entries = s.entries;
      const count = entries.length || 1;
      const avgSets =
        entries.reduce((sum, e) => sum + e.setRecords.length, 0) / count;
      const avgReps =
        entries.reduce((sum, e) => {
          const reps = e.setRecords.reduce((s, r) => s + r.targetReps, 0);
          return sum + (e.setRecords.length ? reps / e.setRecords.length : 0);
        }, 0) / count;
      const totalVolume = entries.reduce(
        (sum, e) => sum + entryVolume(e),
        0,
      );

      return {
        sessionId: s.id,
        date: s.startAt,
        label: formatDateLabel(s.startAt),
        avgSets: Math.round(avgSets * 10) / 10,
        avgReps: Math.round(avgReps * 10) / 10,
        totalVolume,
        programId: s.programId,
        programName: program?.name ?? "Program șters",
      };
    });
}

export function getWeightTrend(
  sessions: Session[],
  granularity: WeightGranularity,
): WeightPoint[] {
  const completed = getCompletedSessions(sessions).filter(
    (s) => s.weightKg !== null && s.weightKg > 0,
  );

  const buckets = new Map<string, { total: number; count: number; date: string }>();

  for (const s of completed) {
    const key =
      granularity === "day"
        ? toLocalDateKey(s.startAt)
        : granularity === "week"
          ? weekKey(s.startAt)
          : monthKey(s.startAt);

    const existing = buckets.get(key);
    if (existing) {
      existing.total += s.weightKg!;
      existing.count++;
    } else {
      buckets.set(key, { total: s.weightKg!, count: 1, date: s.startAt });
    }
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { total, count, date }]) => {
      const d = new Date(date);
      let label: string;
      if (granularity === "day") {
        label = d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
      } else if (granularity === "week") {
        label = `Săpt. ${d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" })}`;
      } else {
        label = d.toLocaleDateString("ro-RO", { month: "short", year: "numeric" });
      }
      return {
        key,
        label,
        weightKg: Math.round((total / count) * 10) / 10,
      };
    });
}
