import "@/app/globals.css";
import { RootProvider } from "fumadocs-ui/provider/next";

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
