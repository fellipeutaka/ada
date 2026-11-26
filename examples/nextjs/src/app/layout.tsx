import "~/styles/globals.css";

import type { Metadata } from "next";
import { Providers } from "~/components/providers";

export const metadata: Metadata = {
  title: "Ada - Next.js Data Table",
  description: "Data table example with Next.js, Prisma, and nuqs",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
      <body className="font-sans wrap-anywhere antialiased selection:bg-[rgba(79,184,178,0.24)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
