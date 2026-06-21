"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, EmptyState, ErrorBanner, LoadingState, PageHeader } from "@/components/ui";
import {
  computeStreak,
  getSessionMetrics,
  getWeightTrend,
  type WeightGranularity,
} from "@/lib/stats";
import { useDb } from "@/lib/useDb";

const chartTooltipStyle = {
  backgroundColor: "rgba(6, 6, 15, 0.9)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "0.75rem",
  color: "#f4f4f5",
};

export default function StatsPage() {
  const { db, loading, error } = useDb();
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [weightGranularity, setWeightGranularity] =
    useState<WeightGranularity>("week");

  const streak = useMemo(() => computeStreak(db.sessions), [db.sessions]);

  const sessionMetrics = useMemo(
    () => getSessionMetrics(db.sessions, db.programs, programFilter),
    [db.sessions, db.programs, programFilter],
  );

  const weightTrend = useMemo(
    () => getWeightTrend(db.sessions, weightGranularity),
    [db.sessions, weightGranularity],
  );

  const completedCount = db.sessions.filter((s) => s.endAt !== null).length;

  if (loading) {
    return (
      <div>
        <PageHeader title="Statistici" description="Se încarcă datele..." />
        <LoadingState />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Statistici"
        description="Progresul tău: sets/reps, streak și greutate."
      />
      {error && <ErrorBanner message={error} />}

      <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
        <div className="glass-card p-3 text-center sm:p-5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted)] sm:text-xs">
            Streak
          </p>
          <p className="stat-value mt-1">{streak}</p>
          <p className="mt-1 hidden text-xs text-[var(--muted)] sm:block">zile consecutive</p>
        </div>
        <div className="glass-card p-3 text-center sm:p-5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted)] sm:text-xs">
            Sesiuni
          </p>
          <p className="stat-value mt-1">{completedCount}</p>
          <p className="mt-1 hidden text-xs text-[var(--muted)] sm:block">finalizate</p>
        </div>
        <div className="glass-card p-3 text-center sm:p-5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted)] sm:text-xs">
            Programe
          </p>
          <p className="stat-value mt-1">{db.programs.length}</p>
          <p className="mt-1 hidden text-xs text-[var(--muted)] sm:block">create</p>
        </div>
      </div>

      {completedCount === 0 ? (
        <EmptyState>
          Nu ai sesiuni finalizate încă. Începe o sesiune pentru a vedea statistici.
        </EmptyState>
      ) : (
        <div className="grid gap-6">
          <Card>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-semibold text-zinc-100 sm:text-base">
                Medie sets / reps per sesiune
              </h2>
              <select
                className="input-dark w-full sm:w-auto sm:min-w-[160px]"
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
              >
                <option value="all">Toate programele</option>
                {db.programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {sessionMetrics.length === 0 ? (
              <EmptyState>Nu există date pentru filtrul selectat.</EmptyState>
            ) : (
              <div className="h-56 w-full min-w-0 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sessionMetrics} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#a1a1aa", fontSize: 10 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: "#a1a1aa", fontSize: 10 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      width={32}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="avgSets"
                      name="Medie sets"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: "#8b5cf6", r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgReps"
                      name="Medie reps"
                      stroke="#22d3ee"
                      strokeWidth={2}
                      dot={{ fill: "#22d3ee", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-semibold text-zinc-100 sm:text-base">Greutate</h2>
              <div className="flex w-full gap-1 rounded-lg border border-white/10 bg-white/5 p-1 sm:w-auto">
                {(
                  [
                    ["day", "Zile"],
                    ["week", "Săpt."],
                    ["month", "Luni"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setWeightGranularity(value)}
                    className={`flex-1 rounded-md px-2 py-2 text-xs font-medium transition-colors sm:flex-none sm:px-3 sm:py-1.5 ${
                      weightGranularity === value
                        ? "bg-gradient-to-r from-violet-600/40 to-cyan-600/30 text-white"
                        : "text-[var(--muted)] hover:text-zinc-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {weightTrend.length === 0 ? (
              <EmptyState>
                Nu ai înregistrat greutatea la sesiuni. Adaugă greutatea la
                începutul unei sesiuni.
              </EmptyState>
            ) : (
              <div className="h-56 w-full min-w-0 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightTrend} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#a1a1aa", fontSize: 10 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      unit=" kg"
                      tick={{ fill: "#a1a1aa", fontSize: 10 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      domain={["auto", "auto"]}
                      width={40}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="weightKg"
                      name="Greutate"
                      stroke="#f472b6"
                      strokeWidth={2}
                      dot={{ fill: "#f472b6", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 text-sm font-semibold text-zinc-100 sm:text-base">
              Volum total per sesiune
            </h2>
            {sessionMetrics.length === 0 ? (
              <EmptyState>Nu există date.</EmptyState>
            ) : (
              <div className="h-48 w-full min-w-0 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sessionMetrics} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#a1a1aa", fontSize: 10 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: "#a1a1aa", fontSize: 10 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      width={32}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="totalVolume"
                      name="Volum (sets×reps)"
                      stroke="#fb923c"
                      strokeWidth={2}
                      dot={{ fill: "#fb923c", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
