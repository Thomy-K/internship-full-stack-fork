"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { me, type MeResponse } from "@/services/auth";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkoutsPanel from "@/components/Dashboard/WorkoutsPanel";
import GeneratePanel from "@/components/Dashboard/GeneratePanel";

export default function DashboardPage() {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    me()
      .then(setUser)
      .catch(() => setErr("Unauthorized. Please login again."));
  }, []);

  return (
    <Protected>
      <AppShell>
        <div className="grid gap-6">
          <div className="relative">
            <div className="absolute right-0 top-0">
              {user && (
                <>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <Badge variant="secondary">{user.email}</Badge>
                </>
              )}
            </div>

            <div className="flex flex-col items-center gap-2 pt-5 pb-2">
              <h1 className="text-3xl font-semibold">Dashboard</h1>
              <p className="text-center text-sm text-muted-foreground">
                Generate personalized workout programs using AI and manage your
                saved workouts all in one place.
              </p>
            </div>
          </div>

          {err && <p className="text-sm text-destructive">{err}</p>}
          {!user && !err && (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}

          <Tabs defaultValue="generate" className="w-full">
            <div className="flex justify-center">
            <TabsList className="grid w-full grid-cols-2 sm:w-[420px]">
              <TabsTrigger value="generate">Generate workout</TabsTrigger>
              <TabsTrigger value="workouts">My workouts</TabsTrigger>
            </TabsList>
            </div>

            <TabsContent value="generate" className="mt-4">
              <GeneratePanel />
            </TabsContent>

            <TabsContent value="workouts" className="mt-4">
              <WorkoutsPanel />
            </TabsContent>
          </Tabs>
        </div>
      </AppShell>
    </Protected>
  );
}
