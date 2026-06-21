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
import { Card, EmptyState, PageHeader } from "@/components/ui";
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
  const { db } = useDb();
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

  return (
    <div>
      <PageHeader
        title="Statistici"
        description="Progresul tău: sets/reps, streak și greutate."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="glass-card p-5 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
            Streak
          </p>
          <p className="stat-value mt-1">{streak}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">zile consecutive</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
            Sesiuni
          </p>
          <p className="stat-value mt-1">{completedCount}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">finalizate</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
            Programe
          </p>
          <p className="stat-value mt-1">{db.programs.length}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">create</p>
        </div>
      </div>

      {completedCount === 0 ? (
        <EmptyState>
          Nu ai sesiuni finalizate încă. Începe o sesiune pentru a vedea statistici.
        </EmptyState>
      ) : (
        <div className="grid gap-6">
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-zinc-100">
                Medie sets / reps per sesiune
              </h2>
              <select
                className="input-dark w-auto min-w-[160px]"
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
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sessionMetrics}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#a1a1aa", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    />
                    <YAxis
                      tick={{ fill: "#a1a1aa", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend />
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
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-zinc-100">Greutate</h2>
              <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
                {(
                  [
                    ["day", "Zile"],
                    ["week", "Săptămâni"],
                    ["month", "Luni"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setWeightGranularity(value)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
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
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightTrend}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#a1a1aa", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    />
                    <YAxis
                      unit=" kg"
                      tick={{ fill: "#a1a1aa", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      domain={["auto", "auto"]}
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
            <h2 className="mb-4 font-semibold text-zinc-100">
              Volum total per sesiune
            </h2>
            {sessionMetrics.length === 0 ? (
              <EmptyState>Nu există date.</EmptyState>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sessionMetrics}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#a1a1aa", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    />
                    <YAxis
                      tick={{ fill: "#a1a1aa", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
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
