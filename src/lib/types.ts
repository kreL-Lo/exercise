export type Id = string;

export type Exercise = {
  id: Id;
  name: string;
  defaultSets: number;
  defaultReps: number;
  createdAt: string; // ISO
};

export type ProgramExercise = {
  exerciseId: Id;
  sets: number;
  reps: number;
};

export type Program = {
  id: Id;
  name: string;
  exercises: ProgramExercise[];
  createdAt: string; // ISO
};

export type SessionSetRecord = {
  targetReps: number;
  /** Reps suplimentare (+) sau lipsă (-) față de plan, per set */
  delta: number;
  /** Durata setului în secunde, null dacă nu e finalizat */
  durationSeconds: number | null;
};

export type SessionEntry = {
  exerciseId: Id;
  targetSets: number;
  targetReps: number;
  setRecords: SessionSetRecord[];
};

export type Session = {
  id: Id;
  programId: Id;
  startAt: string; // ISO
  endAt: string | null; // ISO
  weightKg: number | null;
  entries: SessionEntry[];
};

export type DbV1 = {
  version: 1;
  exercises: Exercise[];
  programs: Program[];
  sessions: Session[];
};
