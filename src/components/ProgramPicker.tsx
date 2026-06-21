"use client";

import type { Program } from "@/lib/types";

const CARD_ACCENTS = [
  "from-violet-600/30 to-purple-900/20 border-violet-500/40",
  "from-cyan-600/25 to-teal-900/20 border-cyan-500/40",
  "from-pink-600/25 to-rose-900/20 border-pink-500/40",
  "from-orange-600/25 to-amber-900/20 border-orange-500/40",
];

export function ProgramPicker({
  programs,
  exerciseNames,
  selectedId,
  onSelect,
}: {
  programs: Program[];
  exerciseNames: Map<string, string>;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {programs.map((program, index) => {
        const selected = program.id === selectedId;
        const totalSets = program.exercises.reduce((s, e) => s + e.sets, 0);
        const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

        return (
          <button
            key={program.id}
            type="button"
            onClick={() => onSelect(program.id)}
            className={`program-card group relative w-full overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200 ${
              selected
                ? "program-card-selected border-violet-400/60 shadow-[0_0_32px_rgba(139,92,246,0.35)]"
                : `bg-gradient-to-br ${accent} hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(139,92,246,0.15)]`
            }`}
          >
            {selected && (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-600/20 via-cyan-600/10 to-pink-600/15" />
            )}

            <div className="relative">
              <div className="flex items-start justify-between gap-2">
                <h3
                  className={`text-lg font-semibold tracking-tight ${
                    selected ? "gradient-text" : "text-zinc-100"
                  }`}
                >
                  {program.name}
                </h3>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                    selected
                      ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-300"
                      : "border-white/15 bg-white/5 text-zinc-500 group-hover:border-white/25"
                  }`}
                >
                  {selected ? "✓" : ""}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-lg bg-black/25 px-2.5 py-1 text-xs font-medium text-zinc-300">
                  {program.exercises.length} exerciții
                </span>
                <span className="rounded-lg bg-black/25 px-2.5 py-1 text-xs font-medium text-cyan-300/80">
                  {totalSets} seturi
                </span>
              </div>

              <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-3">
                {program.exercises.slice(0, 3).map((pe, i) => (
                  <li
                    key={pe.exerciseId}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="truncate text-zinc-400">
                      {i + 1}. {exerciseNames.get(pe.exerciseId) ?? "—"}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-zinc-500">
                      {pe.sets}×{pe.reps}
                    </span>
                  </li>
                ))}
                {program.exercises.length > 3 && (
                  <li className="text-xs text-[var(--muted)]">
                    +{program.exercises.length - 3} exerciții...
                  </li>
                )}
              </ul>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function ProgramDetails({
  program,
  exerciseNames,
}: {
  program: Program;
  exerciseNames: Map<string, string>;
}) {
  return (
    <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-violet-300/80">
        Program selectat — {program.name}
      </p>
      <ol className="space-y-2">
        {program.exercises.map((pe, i) => {
          const name = exerciseNames.get(pe.exerciseId);
          return (
            <li
              key={pe.exerciseId}
              className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2 text-sm"
            >
              <span className="font-medium text-zinc-200">
                {i + 1}. {name ?? "—"}
              </span>
              <span className="font-mono text-cyan-300/80">
                {pe.sets} seturi × {pe.reps} reps
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
