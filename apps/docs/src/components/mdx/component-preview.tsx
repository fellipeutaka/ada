"use client";

import type { ReactNode } from "react";
import { useState } from "react";

interface ComponentPreviewProps {
  children?: ReactNode;
  name: string;
}

export function ComponentPreview({ name, children }: ComponentPreviewProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

  return (
    <div className="mt-6">
      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "preview"
              ? "border-fd-primary text-fd-foreground border-b-2"
              : "text-fd-muted-foreground hover:text-fd-foreground"
          }`}
          onClick={() => setActiveTab("preview")}
          type="button"
        >
          Preview
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "code"
              ? "border-fd-primary text-fd-foreground border-b-2"
              : "text-fd-muted-foreground hover:text-fd-foreground"
          }`}
          onClick={() => setActiveTab("code")}
          type="button"
        >
          Code
        </button>
      </div>

      {activeTab === "preview" ? (
        <div className="grid min-h-80 w-full place-items-center rounded-md border p-10">
          <p className="text-fd-muted-foreground text-sm">
            Preview for <code>{name}</code> — coming soon.
          </p>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
}
