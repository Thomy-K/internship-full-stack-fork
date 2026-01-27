import { apiFetch } from "@/lib/api";

export type WorkoutSummary = {
  id: string;
  title: string;
  created_at: string;
};

export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
};

export type DayProgram = {
  day: number;
  focus: string;
  intensity: "low" | "medium" | "high";
  duration_minutes: number;
  equipment: string[];
  warmup: string[];
  exercises: Exercise[];
  cooldown: string[];
  estimated_calories: number;
};

export type ProgramOK = {
  status: "ok";
  days: DayProgram[];
};

export type ProgramRejected = {
  status: "rejected";
  code: "NOT_FITNESS" | "TOO_VAGUE";
  message: string;
  hints: string[];
};

export type ProgramResponse = ProgramOK | ProgramRejected;

export type WorkoutDetail = {
  id: string;
  title: string;
  input_text?: string | null;
  preferences?: unknown;
  program: ProgramResponse;
  created_at: string;
};

export type SaveWorkoutPayload = {
  title: string;
  input_text?: string | null;
  preferences?: unknown;
  program: ProgramResponse;
};

export async function saveWorkout(
  payload: SaveWorkoutPayload,
): Promise<WorkoutSummary> {
  return apiFetch("/api/workouts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listWorkouts(): Promise<WorkoutSummary[]> {
  return apiFetch("/api/workouts", { method: "GET" });
}

export async function getWorkout(id: string): Promise<WorkoutDetail> {
  return apiFetch(`/api/workouts/${id}`, { method: "GET" });
}

export async function deleteWorkout(id: string): Promise<null> {
  return apiFetch(`/api/workouts/${id}`, { method: "DELETE" });
}
