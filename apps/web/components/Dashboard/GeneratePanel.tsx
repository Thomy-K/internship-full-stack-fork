/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import ProgramForm, { type ProgramFormValues } from "@/components/ProgramForm";
import DayCard, { type DayProgram } from "@/components/DayCard";
import { generateProgram, type ProgramResponse } from "@/services/program";
import { saveWorkout } from "@/services/workouts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";

function downloadJSON(data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "workout-program.json";
  a.click();
  URL.revokeObjectURL(url);
}

function buildPayload(values: ProgramFormValues) {
  const equipment =
    values.equipment_csv
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? undefined;

  const preferences = {
    goal: values.goal || undefined,
    level: values.level || undefined,
    sessions_per_week: values.days_of_week?.length
      ? values.days_of_week.length
      : (values.sessions_per_week ?? undefined),
    duration_minutes: values.duration_minutes ?? undefined,
    days_of_week: values.days_of_week?.length ? values.days_of_week : undefined,
    equipment: equipment?.length ? equipment : undefined,
    constraints: values.constraints || undefined,
  };

  const hasAnyPref = Object.values(preferences).some((v) => v !== undefined);
  return {
    text: values.text,
    preferences: hasAnyPref ? preferences : undefined,
  };
}

export default function GeneratePanel() {
  const [lastFormValues, setLastFormValues] =
    useState<ProgramFormValues | null>(null);
  const [program, setProgram] = useState<ProgramResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const [saveOpen, setSaveOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState("My program");
  const [saving, setSaving] = useState(false);

  const days = useMemo(() => {
    const list: DayProgram[] = (program?.days ?? []) as any;
    return [...list].sort((a, b) => a.day - b.day);
  }, [program]);

  async function onGenerate(values: ProgramFormValues) {
    setLoading(true);
    try {
      setLastFormValues(values);
      const payload = buildPayload(values);
      const data = await generateProgram(payload.text, payload.preferences);
      setProgram(data);
      toast.success("Program generated", {
        description: `Created ${data.days.length} day(s).`,
      });
    } catch (err: any) {
  // handle structured API errors
  if (err instanceof ApiError) {
    const d: any = err.detail;

    if (d?.code === "NOT_FITNESS" || d?.code === "TOO_VAGUE") {
      toast.error(d.code === "NOT_FITNESS" ? "Request rejected" : "Not enough info", {
        description: (
          <div className="grid gap-2">
            <p className="text-sm">{d.message ?? "Your request was rejected."}</p>
            {Array.isArray(d.hints) && d.hints.length > 0 ? (
              <ul className="list-disc pl-5 text-sm">
                {d.hints.slice(0, 3).map((h: string, i: number) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ),
        duration: 8000,
      });
      return;
    }

    // other API errors
    toast.error("Generation failed", {
      description: typeof d === "string" ? d : d?.message ?? "Request failed",
    });
    return;
  }

  // non-API errors
  toast.error("Generation failed", {
    description: "Could not generate a valid program. Try again.",
  });
} finally {

      setLoading(false);
    }
  }

  async function onRegenerate() {
    if (!lastFormValues) return;
    await onGenerate(lastFormValues);
  }

  async function onSave() {
    if (!program || !lastFormValues) return;
    setSaving(true);
    try {
      const payload = buildPayload(lastFormValues);
      await saveWorkout({
        title: saveTitle.trim() || "My program",
        input_text: payload.text,
        preferences: payload.preferences,
        program: {
          status: "ok" as const,
          days: program.days,
        },
      });
      setSaveOpen(false);
      toast.success("Saved", { description: "Workout saved to your library." });
    } catch {
      toast.error("Save failed", {
        description: "Could not save the workout.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate workout</CardTitle>
          <CardDescription>
            Use free text and optional fields to generate a structured program.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <ProgramForm onSubmit={onGenerate} loading={loading} />

          {program && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={onRegenerate}
                disabled={!program || loading}
              >
                Re-generate
              </Button>

              <Button
                variant="outline"
                onClick={() => program && downloadJSON(program)}
                disabled={!program}
              >
                Download JSON
              </Button>

              <Button onClick={() => setSaveOpen(true)} disabled={!program}>
                Save workout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {program && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {days.map((d) => (
            <DayCard key={d.day} day={d} />
          ))}
        </div>
      )}

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save workout</DialogTitle>
            <DialogDescription>
              Give your program a short title.
            </DialogDescription>
          </DialogHeader>

          <Input
            value={saveTitle}
            onChange={(e) => setSaveTitle(e.target.value)}
            placeholder="My program"
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={onSave} disabled={saving || !program}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
