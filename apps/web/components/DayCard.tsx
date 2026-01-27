"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

function equipmentIcon(label: string) {
  const k = label.toLowerCase();
  if (k.includes("bodyweight")) return "🏃";
  if (k.includes("band")) return "🧵";
  if (k.includes("mat")) return "🧘";
  if (k.includes("treadmill") || k.includes("run")) return "🏃";
  if (k.includes("bike")) return "🚴";
  if (k.includes("pull")) return "🏋️";
  if (k.includes("kettle") || k.includes("dumbbell") || k.includes("barbell")) return "🏋️";
  if (k.includes("bench")) return "🪑";
  return "🧰";
}

export default function DayCard({ day }: { day: DayProgram }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Day {day.day}</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{day.focus}</Badge>
          <Badge variant="outline">{day.intensity}</Badge>
          <span className="text-sm text-muted-foreground">{day.duration_minutes} min</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4 text-sm">
        <div className="flex flex-wrap gap-2">
          {day.equipment?.length ? (
            day.equipment.map((eq, i) => (
              <Badge key={i} variant="outline">
                {equipmentIcon(eq)} {eq}
              </Badge>
            ))
          ) : (
            <Badge variant="outline">No equipment</Badge>
          )}
          <Badge variant="secondary">{day.estimated_calories} kcal</Badge>
        </div>

        <div>
          <p className="font-medium">Warmup</p>
          <ul className="list-disc pl-5 text-muted-foreground">
            {day.warmup?.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>

        <div>
          <p className="font-medium">Exercises</p>
          <ul className="list-disc pl-5 text-muted-foreground">
            {day.exercises?.map((ex, i) => (
              <li key={i}>
                {ex.name} | {ex.sets} x {ex.reps} | rest {ex.rest_seconds}s
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-medium">Cooldown</p>
          <ul className="list-disc pl-5 text-muted-foreground">
            {day.cooldown?.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
