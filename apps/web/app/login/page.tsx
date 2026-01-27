"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PublicOnly from "@/components/PublicOnly";
import AppShell from "@/components/AppShell";
import { login } from "@/services/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const schema = z.object({
  email: z.string().email("Invalid email").max(120, "Maximum of 120 characters"),
  password: z.string().min(1, "Password is required").max(72, "Maximum of 72 characters"),
});

type Values = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  const submitting = form.formState.isSubmitting;

  async function onSubmit(values: Values) {
    try {
      await login(values.email, values.password);
      toast.success("Logged in");
      router.push("/dashboard");
    } catch (e: any) {
      toast.error("Login failed", { description: e?.message || "Invalid credentials." });
    }
  }

  return (
    <PublicOnly>
      <AppShell>
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Access your dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs text-destructive" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs text-destructive" />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Logging in..." : "Login"}
                  </Button>

                  <p className="text-sm text-muted-foreground">
                    No account yet?{" "}
                    <a className="underline" href="/signup">
                      Create one
                    </a>
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </PublicOnly>
  );
}
