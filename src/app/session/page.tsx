"use client";

import { useMemo, useState } from "react";
import { ActiveSessionFlow } from "@/components/ActiveSessionFlow";
import { ProgramDetails, ProgramPicker } from "@/components/ProgramPicker";
import { Card, EmptyState, FieldGroup, Label, PageHeader } from "@/components/ui";import { newId } from "@/lib/ids";
import { createSessionEntries } from "@/lib/sessionSteps";
import type { Session, SessionSetRecord } from "@/lib/types";
import { useDb } from "@/lib/useDb";

export default function SessionPage() {
  const { db, update } = useDb();
  const [programId, setProgramId] = useState("");
  const [weightKg, setWeightKg] = useState("");

  const activeSession = useMemo(
    () => db.sessions.find((s) => s.endAt === null) ?? null,
    [db.sessions],
  );

  const exerciseMap = useMemo(
    () => new Map(db.exercises.map((e) => [e.id, e.name])),
    [db.exercises],
  );

  const programMap = useMemo(
    () => new Map(db.programs.map((p) => [p.id, p])),
    [db.programs],
  );

  const activeProgram = activeSession
    ? programMap.get(activeSession.programId)
    : null;

  function startSession(e: React.FormEvent) {
    e.preventDefault();
    if (!programId) return;

    const program = programMap.get(programId);
    if (!program || program.exercises.length === 0) return;

    const weight = weightKg ? parseFloat(weightKg) : null;

    const session: Session = {
      id: newId(),
      programId,
      startAt: new Date().toISOString(),
      endAt: null,
      weightKg: weight && weight > 0 ? weight : null,
      entries: createSessionEntries(program.exercises),
    };

    update((prev) => ({
      ...prev,
      sessions: [...prev.sessions, session],
    }));
    setProgramId("");
    setWeightKg("");
  }

  function updateSetRecord(
    sessionId: string,
    entryIndex: number,
    setIndex: number,
    patch: Partial<SessionSetRecord>,
  ) {
    update((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              entries: s.entries.map((entry, ei) =>
                ei === entryIndex
                  ? {
                      ...entry,
                      setRecords: entry.setRecords.map((record, si) =>
                        si === setIndex ? { ...record, ...patch } : record,
                      ),
                    }
                  : entry,
              ),
            }
          : s,
      ),
    }));
  }

  function endSession(sessionId: string) {
    update((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === sessionId ? { ...s, endAt: new Date().toISOString() } : s,
      ),
    }));
  }

  function cancelSession(sessionId: string) {
    if (!confirm("Anulezi sesiunea curentă?")) return;
    update((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => s.id !== sessionId),
    }));
  }

  const pastSessions = useMemo(
    () =>
      db.sessions
        .filter((s) => s.endAt !== null)
        .sort(
          (a, b) =>
            new Date(b.startAt).getTime() - new Date(a.startAt).getTime(),
        )
        .slice(0, 5),
    [db.sessions],
  );

  if (activeSession) {
    return (
      <div>
        <PageHeader
          title="Sesiune activă"
          description="Parcurge fiecare set pe rând — cronometrează durata și notează reps suplimentare."
        />
        <ActiveSessionFlow
          session={activeSession}
          programName={activeProgram?.name ?? "Program șters"}
          exerciseNames={exerciseMap}
          onUpdateSet={(entryIndex, setIndex, patch) =>
            updateSetRecord(activeSession.id, entryIndex, setIndex, patch)
          }
          onEnd={() => endSession(activeSession.id)}
          onCancel={() => cancelSession(activeSession.id)}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Sesiune"
        description="Alege un program, notează greutatea și începe antrenamentul."
      />

      {db.programs.length === 0 ? (
        <EmptyState>
          Creează mai întâi un program din pagina Programe.
        </EmptyState>
      ) : (
        <form onSubmit={startSession} className="grid gap-6">
          <div>
            <Label>Alege programul de exerciții</Label>
            <div className="mt-3">
              <ProgramPicker
                programs={db.programs}
                exerciseNames={exerciseMap}
                selectedId={programId}
                onSelect={setProgramId}
              />
            </div>
          </div>

          {programId && programMap.get(programId) && (
            <ProgramDetails
              program={programMap.get(programId)!}
              exerciseNames={exerciseMap}
            />
          )}

          <Card className="max-w-lg">
            <FieldGroup>
              <Label htmlFor="session-weight">Greutatea ta (kg)</Label>
              <input
                id="session-weight"
                type="number"
                min={0}
                step={0.1}
                className="input-dark"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="ex. 75.5"
              />
            </FieldGroup>

            <button
              type="submit"
              className="btn-gradient mt-4 w-full"
              disabled={!programId}
            >
              {programId
                ? `Începe sesiunea — ${programMap.get(programId)?.name ?? ""}`
                : "Selectează un program"}
            </button>
          </Card>
        </form>
      )}
      {pastSessions.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-[var(--muted)]">
            Sesiuni recente
          </h2>
          <div className="grid gap-2">
            {pastSessions.map((s) => {
              const prog = programMap.get(s.programId);
              const totalSets = s.entries.reduce(
                (sum, e) => sum + e.setRecords.length,
                0,
              );
              return (
                <div
                  key={s.id}
                  className="glass-card flex flex-wrap items-center justify-between gap-2 p-4"
                >
                  <div>
                    <p className="font-medium text-zinc-100">
                      {prog?.name ?? "Program șters"}
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      {new Date(s.startAt).toLocaleDateString("ro-RO", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    {s.weightKg !== null && (
                      <span className="text-cyan-300/80">{s.weightKg} kg</span>
                    )}
                    <span className="text-[var(--muted)]">
                      {totalSets} seturi
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
