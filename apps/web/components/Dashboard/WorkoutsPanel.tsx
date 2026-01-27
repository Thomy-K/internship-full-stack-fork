/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  listWorkouts,
  getWorkout,
  deleteWorkout,
  type WorkoutSummary,
  type WorkoutDetail,
} from "@/services/workouts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function fmtDate(s: string) {
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s;
  }
}

export default function WorkoutsPanel() {
  const [items, setItems] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<WorkoutDetail | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const data = await listWorkouts();
      setItems(data);
    } catch (e: any) {
      if (e?.message === "UNAUTHORIZED") return;
      toast.error("Could not load workouts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function openDetail(id: string) {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const data = await getWorkout(id);
      setDetail(data);
    } catch (e: any) {
      if (e?.message === "UNAUTHORIZED") return;
      toast.error("Could not load workout details");
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }

  async function onDelete(id: string) {
    const ok = confirm("Delete this workout?");
    if (!ok) return;

    try {
      await deleteWorkout(id);
      toast.success("Workout deleted");
      if (detail?.id === id) {
        setDetailOpen(false);
        setDetail(null);
      }
      await refresh();
    } catch (e: any) {
      if (e?.message === "UNAUTHORIZED") return;
      toast.error("Delete failed");
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>My workouts</CardTitle>
          <CardDescription>
            These are your saved AI-generated workout programs. Click to view
            details.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No workouts yet. Generate a workout and save it.
            </p>
          ) : (
            <div className="grid gap-2">
              {items.map((w) => (
                <div
                  key={w.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openDetail(w.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") openDetail(w.id);
                  }}
                  className="cursor-pointer rounded-lg border p-3 transition hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{w.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {fmtDate(w.created_at)}
                      </p>
                    </div>

                    <div className="mt-2 flex gap-2 sm:mt-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetail(w.id);
                        }}
                      >
                        View
                      </Button>

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(w.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Workout details</DialogTitle>
            <DialogDescription>
              Full program: days, focus, and exercises.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[75vh] overflow-y-auto pr-2">
            {detailLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : !detail ? (
              <p className="text-sm text-muted-foreground">No data.</p>
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-1">
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{detail.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmtDate(detail.created_at)}
                  </p>
                </div>

                {detail.program.status === "rejected" ? (
                  <div className="rounded-lg border p-3">
                    <p className="font-medium">Rejected</p>
                    <p className="text-sm text-muted-foreground">
                      {detail.program.message}
                    </p>
                    {detail.program.hints?.length ? (
                      <ul className="mt-2 list-disc pl-5 text-sm">
                        {detail.program.hints.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : (
                  <div className="grid gap-3">
                    <Separator />

                    <div className="grid gap-3">
                      {detail.program.days.map((d) => (
                        <div key={d.day} className="rounded-lg border p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-medium">
                              Day {d.day}: {d.focus}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {d.duration_minutes} min • intensity:{" "}
                              {d.intensity}
                            </p>
                          </div>

                          {d.equipment?.length ? (
                            <p className="mt-2 text-sm">
                              <span className="text-muted-foreground">
                                Equipment:
                              </span>{" "}
                              {d.equipment.join(", ")}
                            </p>
                          ) : null}

                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <div>
                              <p className="text-sm font-medium">Warmup</p>
                              {d.warmup?.length ? (
                                <ul className="list-disc pl-5 text-sm">
                                  {d.warmup.map((w, i) => (
                                    <li key={i}>{w}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  None
                                </p>
                              )}
                            </div>

                            <div>
                              <p className="text-sm font-medium">Cooldown</p>
                              {d.cooldown?.length ? (
                                <ul className="list-disc pl-5 text-sm">
                                  {d.cooldown.map((c, i) => (
                                    <li key={i}>{c}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  None
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-sm font-medium">Exercises</p>
                            <div className="mt-1 grid gap-2">
                              {d.exercises.map((ex, i) => (
                                <div
                                  key={i}
                                  className="rounded-md border px-3 py-2 text-sm"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="font-medium">{ex.name}</p>
                                    <p className="text-muted-foreground">
                                      {ex.sets} × {ex.reps} • rest{" "}
                                      {ex.rest_seconds}s
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <p className="mt-3 text-sm text-muted-foreground">
                            Estimated calories: {d.estimated_calories}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Close
            </Button>

            {detail?.id ? (
              <Button
                variant="destructive"
                onClick={() => onDelete(detail.id)}
                disabled={detailLoading}
              >
                Delete
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
