"use client";

import { Toaster } from "@ada/ui/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NuqsAdapter>{children}</NuqsAdapter>
      <Toaster />
    </ThemeProvider>
  );
}
