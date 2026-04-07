import { Toaster } from "@ada/ui/components/ui/sonner";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ada - Next.js Data Table",
  description: "Data table example with Next.js, Prisma, and nuqs",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
      <body className="wrap-anywhere font-sans antialiased selection:bg-[rgba(79,184,178,0.24)]">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NuqsAdapter>{children}</NuqsAdapter>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
