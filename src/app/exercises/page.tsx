"use client";

import { useState } from "react";
import { Card, EmptyState, ErrorBanner, FieldGroup, Label, LoadingState, PageHeader } from "@/components/ui";
import { newId } from "@/lib/ids";
import type { Exercise, ExerciseType } from "@/lib/types";
import { useDb } from "@/lib/useDb";

const TYPE_LABELS: Record<ExerciseType, string> = {
  bodyweight: "Body weight",
  weight: "Weight",
};

function exerciseSubtitle(ex: Exercise): string {
  const base = `${ex.defaultSets} sets × ${ex.defaultReps} reps`;
  if (ex.type === "weight" && ex.weightKg !== null) {
    return `${TYPE_LABELS[ex.type]} · ${ex.weightKg} kg · ${base}`;
  }
  return `${TYPE_LABELS[ex.type]} · ${base}`;
}

export default function ExercisesPage() {
  const { db, update, loading, error } = useDb();
  const [name, setName] = useState("");
  const [type, setType] = useState<ExerciseType>("bodyweight");
  const [weightKg, setWeightKg] = useState("");
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [editingId, setEditingId] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setType("bodyweight");
    setWeightKg("");
    setSets(3);
    setReps(10);
    setEditingId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const parsedWeight =
      type === "weight" && weightKg ? parseFloat(weightKg) : null;
    if (type === "weight" && (!parsedWeight || parsedWeight <= 0)) {
      alert("Introdu greutatea (kg) pentru exercițiile de tip Weight.");
      return;
    }

    const payload = {
      name: trimmed,
      type,
      weightKg: type === "weight" ? parsedWeight : null,
      defaultSets: sets,
      defaultReps: reps,
    };

    if (editingId) {
      update((prev) => ({
        ...prev,
        exercises: prev.exercises.map((ex) =>
          ex.id === editingId ? { ...ex, ...payload } : ex,
        ),
      }));
    } else {
      const exercise: Exercise = {
        id: newId(),
        ...payload,
        createdAt: new Date().toISOString(),
      };
      update((prev) => ({
        ...prev,
        exercises: [...prev.exercises, exercise],
      }));
    }
    resetForm();
  }

  function startEdit(ex: Exercise) {
    setEditingId(ex.id);
    setName(ex.name);
    setType(ex.type);
    setWeightKg(ex.weightKg !== null ? String(ex.weightKg) : "");
    setSets(ex.defaultSets);
    setReps(ex.defaultReps);
  }

  function handleDelete(id: string) {
    if (!confirm("Ștergi acest exercițiu? Va fi eliminat și din programe.")) return;
    update((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((ex) => ex.id !== id),
      programs: prev.programs.map((p) => ({
        ...p,
        exercises: p.exercises.filter((e) => e.exerciseId !== id),
      })),
    }));
    if (editingId === id) resetForm();
  }

  return (
    <div>
      <PageHeader
        title="Exerciții"
        description="Creează exerciții body weight sau cu greutate (kg), sets și reps implicite."
      />
      {error && <ErrorBanner message={error} />}
      {loading ? (
        <LoadingState />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="mb-4 font-semibold text-zinc-100">
              {editingId ? "Editează exercițiul" : "Adaugă exercițiu"}
            </h2>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <FieldGroup>
                <Label htmlFor="ex-name">Nume</Label>
                <input
                  id="ex-name"
                  className="input-dark"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex. Genuflexiuni"
                  required
                />
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="ex-type">Tip</Label>
                <select
                  id="ex-type"
                  className="input-dark"
                  value={type}
                  onChange={(e) => {
                    const next = e.target.value as ExerciseType;
                    setType(next);
                    if (next === "bodyweight") setWeightKg("");
                  }}
                >
                  <option value="bodyweight">Body weight</option>
                  <option value="weight">Weight</option>
                </select>
              </FieldGroup>

              {type === "weight" && (
                <FieldGroup>
                  <Label htmlFor="ex-weight">Greutate (kg)</Label>
                  <input
                    id="ex-weight"
                    type="number"
                    min={0.5}
                    step={0.5}
                    className="input-dark"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="ex. 20"
                    required
                  />
                </FieldGroup>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FieldGroup>
                  <Label htmlFor="ex-sets">Sets</Label>
                  <input
                    id="ex-sets"
                    type="number"
                    min={1}
                    className="input-dark"
                    value={sets}
                    onChange={(e) => setSets(Number(e.target.value))}
                    required
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="ex-reps">Reps</Label>
                  <input
                    id="ex-reps"
                    type="number"
                    min={1}
                    className="input-dark"
                    value={reps}
                    onChange={(e) => setReps(Number(e.target.value))}
                    required
                  />
                </FieldGroup>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button type="submit" className="btn-gradient w-full sm:w-auto">
                  {editingId ? "Salvează" : "Adaugă"}
                </button>
                {editingId && (
                  <button type="button" className="btn-ghost w-full sm:w-auto" onClick={resetForm}>
                    Anulează
                  </button>
                )}
              </div>
            </form>
          </Card>

          <div className="grid gap-3 content-start">
            {db.exercises.length === 0 ? (
              <EmptyState>Nu ai exerciții încă. Adaugă primul exercițiu.</EmptyState>
            ) : (
              db.exercises.map((ex) => (
                <div
                  key={ex.id}
                  className={`glass-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${
                    editingId === ex.id ? "ring-1 ring-violet-500/50" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-zinc-100">{ex.name}</p>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                          ex.type === "weight"
                            ? "bg-cyan-500/15 text-cyan-300"
                            : "bg-violet-500/15 text-violet-300"
                        }`}
                      >
                        {TYPE_LABELS[ex.type]}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-[var(--muted)]">
                      {exerciseSubtitle(ex)}
                    </p>
                  </div>
                  <div className="flex gap-2 sm:shrink-0">
                    <button
                      type="button"
                      className="btn-ghost flex-1 px-3 py-2 text-xs sm:flex-none sm:py-1.5"
                      onClick={() => startEdit(ex)}
                    >
                      Editează
                    </button>
                    <button
                      type="button"
                      className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300 hover:bg-red-500/20 sm:flex-none sm:py-1.5"
                      onClick={() => handleDelete(ex.id)}
                    >
                      Șterge
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
