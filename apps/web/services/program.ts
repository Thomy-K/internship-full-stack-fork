import { apiFetch } from "@/lib/api";

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

export type ProgramOK = { status: "ok"; days: DayProgram[] };

export type ProgramRejected = {
  status: "rejected";
  code: "NOT_FITNESS" | "TOO_VAGUE";
  message: string;
  hints: string[];
};

export type ProgramResponse = ProgramOK | ProgramRejected;

export async function generateProgram(
  text: string,
  preferences?: Record<string, unknown>,
): Promise<ProgramResponse> {
  return apiFetch("/api/ai/program", {
    method: "POST",
    body: JSON.stringify({ text, preferences }),
  });
}
