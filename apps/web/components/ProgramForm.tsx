"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Loader } from "./ui/loader";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const programFormSchema = z.object({
  text: z
    .string()
    .min(12, "Minimum of 12 characters")
    .max(4000, "Maximum of 4000 characters"),

  goal: z
    .string()
    .max(80, "Maximum of 80 characters")
    .optional()
    .or(z.literal("")),
  level: z
    .string()
    .max(40, "Maximum of 40 characters")
    .optional()
    .or(z.literal("")),
  sessions_per_week: z.coerce
    .number()
    .int("Must be an integer")
    .min(1, "Minimum is 1")
    .max(7, "Maximum is 7")
    .optional()
    .or(z.nan()),
  duration_minutes: z.coerce
    .number()
    .int("Must be an integer")
    .min(10, "Minimum is 10")
    .max(180, "Maximum is 180")
    .optional()
    .or(z.nan()),

  days_of_week: z.array(z.string()).optional(),

  equipment_csv: z
    .string()
    .max(120, "Maximum of 120 characters")
    .optional()
    .or(z.literal("")),
  constraints: z
    .string()
    .max(200, "Maximum of 200 characters")
    .optional()
    .or(z.literal("")),
});

export type ProgramFormValues = z.infer<typeof programFormSchema>;

export interface ProgramFormProps {
  onSubmit: (values: ProgramFormValues) => void;
  loading: boolean;
}

export default function ProgramForm({ onSubmit, loading }: ProgramFormProps) {
  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      text: "",
      days_of_week: [],
      goal: "",
      level: "",
      equipment_csv: "",
      constraints: "",
    },
    mode: "onBlur",
  });

  const [advancedOpen, setAdvancedOpen] = useState(false);

  const selectedDays =
    useWatch({
      control: form.control,
      name: "days_of_week",
      defaultValue: [],
    }) ?? [];
  const daysCount = selectedDays.length;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Describe your request</FormLabel>
              <FormControl>
                <Textarea
                  rows={6}
                  placeholder='Example: "Lose weight, 4 sessions/week, 45 min, no dumbbells, intermediate level"'
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAdvancedOpen((v) => !v)}
          >
            {advancedOpen ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Hide advanced options
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Show advanced options
              </>
            )}
          </Button>

          <Button
            type="submit"
            disabled={loading}
            size="sm"
            className="disabled:opacity-90"
          >
            {loading ? <Loader text="Generating..." /> : "Generate"}
          </Button>
        </div>

        {/* Advanced options collapsible */}
        {advancedOpen && (
          <Card className="p-4">
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="fat loss, strength, endurance"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="beginner, intermediate, advanced"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sessions_per_week"
                  render={({ field }) => {
                    const locked = daysCount > 0;

                    return (
                      <FormItem>
                        <FormLabel>Sessions per week</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="4"
                            disabled={locked}
                            value={
                              field.value === undefined
                                ? ""
                                : String(field.value)
                            }
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v === "") field.onChange(undefined);
                              else field.onChange(Number(v));
                            }}
                          />
                        </FormControl>

                        {locked ? (
                          <p className="text-xs text-muted-foreground">
                            Synced with selected days ({daysCount}).
                          </p>
                        ) : null}

                        <FormMessage className="text-xs text-destructive" />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="45" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="days_of_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days of week</FormLabel>
                    <div className="flex flex-wrap gap-3">
                      {days.map((d) => {
                        const checked = (field.value ?? []).includes(d);
                        return (
                          <label
                            key={d}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => {
                                const next = new Set(field.value ?? []);
                                if (v) next.add(d);
                                else next.delete(d);
                                field.onChange(Array.from(next));
                                const nextArr = Array.from(next);
                                field.onChange(nextArr);
                                if (nextArr.length > 0) {
                                  form.setValue(
                                    "sessions_per_week",
                                    nextArr.length as any,
                                    { shouldValidate: true },
                                  );
                                }
                              }}
                            />
                            {d}
                          </label>
                        );
                      })}
                    </div>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="equipment_csv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipment (comma separated)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="bodyweight, resistance band"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="constraints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Constraints</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="knee pain, no dumbbells"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>
        )}
      </form>
    </Form>
  );
}
