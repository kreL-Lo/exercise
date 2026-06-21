"use client";

import { useMemo, useState } from "react";
import { Card, EmptyState, FieldGroup, Label, PageHeader } from "@/components/ui";
import { newId } from "@/lib/ids";
import type { Program, ProgramExercise } from "@/lib/types";
import { useDb } from "@/lib/useDb";

type DraftExercise = ProgramExercise & { selected: boolean };

export default function ProgramsPage() {
  const { db, update } = useDb();
  const [name, setName] = useState("");
  const [draft, setDraft] = useState<DraftExercise[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const exerciseMap = useMemo(
    () => new Map(db.exercises.map((e) => [e.id, e])),
    [db.exercises],
  );

  function initDraft(from?: ProgramExercise[]) {
    const existing = new Map(from?.map((e) => [e.exerciseId, e]));
    setDraft(
      db.exercises.map((ex) => {
        const saved = existing?.get(ex.id);
        return {
          exerciseId: ex.id,
          sets: saved?.sets ?? ex.defaultSets,
          reps: saved?.reps ?? ex.defaultReps,
          selected: !!saved,
        };
      }),
    );
  }

  function resetForm() {
    setName("");
    setEditingId(null);
    initDraft();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const exercises = draft
      .filter((d) => d.selected)
      .map(({ exerciseId, sets, reps }) => ({ exerciseId, sets, reps }));

    if (exercises.length === 0) {
      alert("Selectează cel puțin un exercițiu.");
      return;
    }

    if (editingId) {
      update((prev) => ({
        ...prev,
        programs: prev.programs.map((p) =>
          p.id === editingId ? { ...p, name: trimmed, exercises } : p,
        ),
      }));
    } else {
      const program: Program = {
        id: newId(),
        name: trimmed,
        exercises,
        createdAt: new Date().toISOString(),
      };
      update((prev) => ({
        ...prev,
        programs: [...prev.programs, program],
      }));
    }
    resetForm();
  }

  function startEdit(program: Program) {
    setEditingId(program.id);
    setName(program.name);
    initDraft(program.exercises);
  }

  function startCreate() {
    setEditingId(null);
    setName("");
    initDraft();
  }

  function handleDelete(id: string) {
    if (!confirm("Ștergi acest program?")) return;
    update((prev) => ({
      ...prev,
      programs: prev.programs.filter((p) => p.id !== id),
    }));
    if (editingId === id) resetForm();
  }

  function toggleExercise(exerciseId: string) {
    setDraft((prev) =>
      prev.map((d) =>
        d.exerciseId === exerciseId ? { ...d, selected: !d.selected } : d,
      ),
    );
  }

  function updateDraft(
    exerciseId: string,
    field: "sets" | "reps",
    value: number,
  ) {
    setDraft((prev) =>
      prev.map((d) =>
        d.exerciseId === exerciseId ? { ...d, [field]: value } : d,
      ),
    );
  }

  const formReady = draft.length > 0 || db.exercises.length === 0;

  return (
    <div>
      <PageHeader
        title="Programe"
        description="Creează programe de antrenament din exercițiile tale."
      />

      {db.exercises.length === 0 ? (
        <EmptyState>
          Mai întâi adaugă exerciții din pagina Exerciții, apoi revino aici.
        </EmptyState>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-zinc-100">
                {editingId ? "Editează programul" : "Program nou"}
              </h2>
              {!editingId && db.programs.length > 0 && (
                <button type="button" className="btn-ghost px-3 py-1.5 text-xs" onClick={startCreate}>
                  Reset
                </button>
              )}
            </div>

            {formReady && draft.length === 0 && (
              <button type="button" className="btn-ghost mb-4" onClick={() => initDraft()}>
                Începe program nou
              </button>
            )}

            {(draft.length > 0 || editingId) && (
              <form onSubmit={handleSubmit} className="grid gap-4">
                <FieldGroup>
                  <Label htmlFor="prog-name">Nume program</Label>
                  <input
                    id="prog-name"
                    className="input-dark"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex. Full Body"
                    required
                  />
                </FieldGroup>

                <div>
                  <Label>Exerciții incluse</Label>
                  <div className="mt-2 grid gap-2">
                    {draft.map((d) => {
                      const ex = exerciseMap.get(d.exerciseId);
                      if (!ex) return null;
                      return (
                        <div
                          key={d.exerciseId}
                          className={`rounded-xl border p-3 transition-colors ${
                            d.selected
                              ? "border-violet-500/40 bg-violet-500/10"
                              : "border-white/10 bg-white/2"
                          }`}
                        >
                          <label className="flex cursor-pointer items-center gap-3">
                            <input
                              type="checkbox"
                              checked={d.selected}
                              onChange={() => toggleExercise(d.exerciseId)}
                              className="h-4 w-4 accent-violet-500"
                            />
                            <span className="flex-1 font-medium text-zinc-100">
                              {ex.name}
                            </span>
                          </label>
                          {d.selected && (
                            <div className="mt-3 grid grid-cols-2 gap-3 pl-7">
                              <FieldGroup>
                                <Label>Sets</Label>
                                <input
                                  type="number"
                                  min={1}
                                  className="input-dark"
                                  value={d.sets}
                                  onChange={(e) =>
                                    updateDraft(d.exerciseId, "sets", Number(e.target.value))
                                  }
                                />
                              </FieldGroup>
                              <FieldGroup>
                                <Label>Reps</Label>
                                <input
                                  type="number"
                                  min={1}
                                  className="input-dark"
                                  value={d.reps}
                                  onChange={(e) =>
                                    updateDraft(d.exerciseId, "reps", Number(e.target.value))
                                  }
                                />
                              </FieldGroup>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="btn-gradient">
                    {editingId ? "Salvează" : "Creează program"}
                  </button>
                  {editingId && (
                    <button type="button" className="btn-ghost" onClick={resetForm}>
                      Anulează
                    </button>
                  )}
                </div>
              </form>
            )}

            {draft.length === 0 && !editingId && (
              <button type="button" className="btn-gradient" onClick={() => initDraft()}>
                Creează program nou
              </button>
            )}
          </Card>

          <div className="grid gap-3 content-start">
            {db.programs.length === 0 ? (
              <EmptyState>Nu ai programe încă.</EmptyState>
            ) : (
              db.programs.map((program) => (
                <div key={program.id} className="glass-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-zinc-100">{program.name}</p>
                      <p className="mt-0.5 text-sm text-[var(--muted)]">
                        {program.exercises.length} exerciții
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn-ghost px-3 py-1.5 text-xs"
                        onClick={() => startEdit(program)}
                      >
                        Editează
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20"
                        onClick={() => handleDelete(program.id)}
                      >
                        Șterge
                      </button>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1 border-t border-white/10 pt-3">
                    {program.exercises.map((pe) => {
                      const ex = exerciseMap.get(pe.exerciseId);
                      return (
                        <li
                          key={pe.exerciseId}
                          className="flex justify-between text-sm text-zinc-400"
                        >
                          <span>{ex?.name ?? "Exercițiu șters"}</span>
                          <span className="font-mono text-cyan-300/70">
                            {pe.sets}×{pe.reps}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
