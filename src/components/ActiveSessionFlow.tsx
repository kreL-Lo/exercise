"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Label } from "@/components/ui";
import { useSetTimer } from "@/hooks/useSetTimer";
import {
  entryVolume,
  flattenSessionSteps,
  formatDuration,
} from "@/lib/sessionSteps";
import type { Session, SessionSetRecord } from "@/lib/types";

function DeltaControl({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Label>Reps suplimentare / lipsă (acest set)</Label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Scade"
          disabled={disabled}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl font-medium text-zinc-200 transition-colors hover:border-violet-500/40 hover:bg-violet-500/15 disabled:opacity-40 sm:h-11 sm:w-11 sm:text-xl"
          onClick={() => onChange(value - 1)}
        >
          −
        </button>
        <span
          className={`min-w-[3rem] text-center text-2xl font-bold tabular-nums ${
            value > 0
              ? "text-emerald-400"
              : value < 0
                ? "text-red-400"
                : "text-zinc-300"
          }`}
        >
          {value > 0 ? `+${value}` : value}
        </span>
        <button
          type="button"
          aria-label="Crește"
          disabled={disabled}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl font-medium text-zinc-200 transition-colors hover:border-cyan-500/40 hover:bg-cyan-500/15 disabled:opacity-40 sm:h-11 sm:w-11 sm:text-xl"
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function ActiveSessionFlow({
  session,
  programName,
  exerciseNames,
  onUpdateSet,
  onEnd,
  onCancel,
}: {
  session: Session;
  programName: string;
  exerciseNames: Map<string, string>;
  onUpdateSet: (
    entryIndex: number,
    setIndex: number,
    patch: Partial<SessionSetRecord>,
  ) => void;
  onEnd: () => void;
  onCancel: () => void;
}) {
  const steps = useMemo(() => flattenSessionSteps(session), [session]);
  const [stepIndex, setStepIndex] = useState(0);
  const { elapsed, running, start, stop, reset } = useSetTimer();

  useEffect(() => {
    setStepIndex(0);
    reset();
  }, [session.id, reset]);

  const safeIndex = Math.min(stepIndex, Math.max(0, steps.length - 1));
  const step = steps[safeIndex];
  if (!step) return null;

  const entry = session.entries[step.entryIndex];
  const setRecord = entry.setRecords[step.setIndex];
  const exerciseName =
    exerciseNames.get(step.exerciseId) ?? "Exercițiu șters";
  const isCompleted = setRecord.durationSeconds !== null;
  const isLast = safeIndex === steps.length - 1;

  const completedSetsForExercise = entry.setRecords.filter(
    (r) => r.durationSeconds !== null,
  );

  function handleStartSet() {
    onUpdateSet(step.entryIndex, step.setIndex, { durationSeconds: null });
    start();
  }

  function handleFinishSet() {
    const duration = stop();
    onUpdateSet(step.entryIndex, step.setIndex, { durationSeconds: duration });
  }

  function handleGoToStep(index: number) {
    if (running) return;
    setStepIndex(index);
    reset();
  }

  function handleRedoSet() {
    onUpdateSet(step.entryIndex, step.setIndex, {
      durationSeconds: null,
      delta: 0,
    });
    reset();
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-4">
          <div className="glass-card px-3 py-2.5 sm:px-4 sm:py-3">
            <p className="text-xs text-[var(--muted)]">Program</p>
            <p className="truncate font-medium text-zinc-100">{programName}</p>
          </div>
          <div className="glass-card px-3 py-2.5 sm:px-4 sm:py-3">
            <p className="text-xs text-[var(--muted)]">Progres total</p>
            <p className="font-medium text-zinc-100">
              Set {safeIndex + 1} / {steps.length}
            </p>
          </div>
          {session.weightKg !== null && (
            <div className="glass-card col-span-2 px-3 py-2.5 sm:col-span-1 sm:px-4 sm:py-3">
              <p className="text-xs text-[var(--muted)]">Greutate</p>
              <p className="stat-value text-xl">{session.weightKg} kg</p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:ml-auto sm:flex sm:gap-2">
          <button type="button" className="btn-ghost w-full text-sm" onClick={onCancel}>
            Anulează
          </button>
          <button type="button" className="btn-gradient w-full text-sm" onClick={onEnd}>
            Termină
          </button>
        </div>
      </div>

      <div className="scroll-x-mobile mb-4 flex gap-1.5 pb-1">
        {steps.map((s, i) => {
          const done =
            session.entries[s.entryIndex].setRecords[s.setIndex]
              .durationSeconds !== null;
          const active = i === safeIndex;
          return (
            <button
              key={`${s.entryIndex}-${s.setIndex}`}
              type="button"
              aria-label={`Set ${i + 1}`}
              disabled={running}
              onClick={() => handleGoToStep(i)}
              className={`h-2 rounded-full transition-all disabled:cursor-not-allowed ${
                active
                  ? "w-6 bg-gradient-to-r from-violet-500 to-cyan-500"
                  : done
                    ? "w-2 bg-emerald-500/60"
                    : "w-2 bg-white/15"
              }`}
            />
          );
        })}
      </div>

      <Card className="mx-auto w-full max-w-lg">
        <div className="mb-5 text-center sm:mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
            {exerciseName}
          </p>
          <h2 className="mt-1 text-xl font-bold gradient-text sm:text-2xl">
            Set {step.setNumber} / {step.totalSetsInExercise}
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Țintă:{" "}
            <span className="font-mono text-lg text-cyan-300/90 sm:text-xl">
              {setRecord.targetReps} reps
            </span>
          </p>
        </div>

        <div className="mb-6 flex flex-col items-center sm:mb-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
            Durata setului
          </p>
          <div
            className={`font-mono text-4xl font-bold tabular-nums tracking-tight sm:text-5xl ${
              running
                ? "gradient-text"
                : isCompleted
                  ? "text-emerald-400"
                  : "text-zinc-500"
            }`}
          >
            {formatDuration(
              isCompleted && !running
                ? setRecord.durationSeconds!
                : elapsed,
            )}
          </div>
          {running && (
            <p className="mt-2 animate-pulse text-xs text-cyan-300/70">
              Cronometru activ...
            </p>
          )}
          {isCompleted && !running && (
            <p className="mt-2 text-xs text-emerald-400/80">Set finalizat</p>
          )}
        </div>

        <div className="mb-8 border-t border-white/10 pt-8">
          <DeltaControl
            value={setRecord.delta}
            disabled={running}
            onChange={(delta) =>
              onUpdateSet(step.entryIndex, step.setIndex, { delta })
            }
          />
        </div>

        {completedSetsForExercise.length > 0 && (
          <div className="mb-6 rounded-xl border border-white/10 bg-white/3 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              Seturi finalizate — {exerciseName}
            </p>
            <ul className="space-y-1.5">
              {entry.setRecords.map((record, i) => {
                if (record.durationSeconds === null) return null;
                return (
                  <li
                    key={i}
                    className="flex justify-between text-sm text-zinc-400"
                  >
                    <span>Set {i + 1}</span>
                    <span className="font-mono">
                      {formatDuration(record.durationSeconds)}
                      {record.delta !== 0 && (
                        <span
                          className={
                            record.delta > 0
                              ? " text-emerald-400"
                              : " text-red-400"
                          }
                        >
                          {" "}
                          ({record.delta > 0 ? "+" : ""}
                          {record.delta} reps)
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-center">
          <p className="text-xs text-[var(--muted)]">Volum exercițiu</p>
          <p className="mt-1 font-mono text-lg text-cyan-300/90">
            {entryVolume(entry)} reps total
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-3">
          <button
            type="button"
            className="btn-ghost order-2 w-full sm:order-1 sm:flex-1"
            disabled={safeIndex === 0 || running}
            onClick={() => handleGoToStep(safeIndex - 1)}
          >
            ← Anterior
          </button>

          {!running && !isCompleted && (
            <button
              type="button"
              className="btn-gradient order-1 w-full sm:order-2 sm:flex-1"
              onClick={handleStartSet}
            >
              Începe setul
            </button>
          )}

          {running && (
            <button
              type="button"
              className="btn-gradient order-1 w-full sm:order-2 sm:flex-1"
              onClick={handleFinishSet}
            >
              Termină setul
            </button>
          )}

          {!running && isCompleted && !isLast && (
            <button
              type="button"
              className="btn-gradient order-1 w-full sm:order-2 sm:flex-1"
              onClick={() => {
                setStepIndex(safeIndex + 1);
                reset();
              }}
            >
              Următorul set →
            </button>
          )}

          {!running && isCompleted && isLast && (
            <button type="button" className="btn-gradient order-1 w-full sm:order-2 sm:flex-1" onClick={onEnd}>
              Finalizează sesiunea
            </button>
          )}
        </div>

        {!running && isCompleted && (
          <button
            type="button"
            className="mt-3 w-full text-center text-xs text-[var(--muted)] underline underline-offset-4 hover:text-zinc-300"
            onClick={handleRedoSet}
          >
            Refă acest set
          </button>
        )}
      </Card>
    </div>
  );
}
