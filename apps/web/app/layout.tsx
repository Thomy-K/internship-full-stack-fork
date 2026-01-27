import type { Metadata } from "next";

// @ts-expect-error missing types
import "./globals.css"
import ThemeProvider from "@/components/ThemeProvider";
import ToasterMount from "@/components/ToasterMount";

export const metadata: Metadata = {
  title: "Workout Program Generator",
  description: "AI that generates a workout program from free-form text",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <ToasterMount />
        </ThemeProvider>
      </body>
    </html>
  );
}
