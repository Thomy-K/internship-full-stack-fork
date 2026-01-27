import AppShell from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <AppShell>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Use the navigation to signup, login, access the dashboard, and generate a workout program.
        </CardContent>
      </Card>
    </AppShell>
  );
}
