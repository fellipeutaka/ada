"use client";

import { Button } from "@ada/ui/components/ui/button";
import {
  GithubLogoIcon,
  MoonIcon,
  SunIcon,
  TableIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useTheme } from "next-themes";

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            className="flex items-center gap-2"
            nativeButton={false}
            render={<Link href="/" />}
            variant="ghost"
          >
            <TableIcon />
            Ada
          </Button>

          <nav className="flex w-full items-center">
            <Button
              nativeButton={false}
              render={<Link href="/docs" />}
              size="sm"
              variant="ghost"
            >
              Docs
            </Button>
          </nav>
        </div>
        <nav className="flex items-center">
          <Button
            nativeButton={false}
            render={
              <Link
                aria-label="GitHub repository"
                href="https://github.com/fellipeutaka/ada"
                rel="noopener noreferrer"
                target="_blank"
              />
            }
            size="icon"
            variant="ghost"
          >
            <GithubLogoIcon className="size-4" />
          </Button>
          <Button
            aria-label="Toggle theme"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            size="icon"
            variant="ghost"
          >
            <SunIcon className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <MoonIcon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </Button>
        </nav>
      </div>
    </header>
  );
}
