"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { logout } from "@/services/auth";
import ModeToggle from "@/components/ModeToggle";
import { useAuthStatus } from "@/hooks/useAuthStatus";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "text-sm",
        active
          ? "font-semibold"
          : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { loggedIn } = useAuthStatus();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="font-semibold">
            Internship Full Stack
          </Link>

          <nav className="flex items-center gap-4">
            <div className="pr-6">
            <ModeToggle />
            </div>

            {!loggedIn && (
              <>
                <NavLink href="/signup" label="Signup" />
                <div className="h-4 w-px bg-border" />
                <NavLink href="/login" label="Login" />
              </>
            )}

            {loggedIn && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
              >
                Logout
              </Button>
            )}
          </nav>
        </div>
      </header>

      <Separator />

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
