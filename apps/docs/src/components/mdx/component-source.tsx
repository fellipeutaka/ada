import { ServerCodeBlock } from "fumadocs-ui/components/codeblock.rsc";
import { getRegistryFileMeta, getRegistryItem } from "@/lib/registry";

interface ComponentSourceProps {
  name: string;
}

export async function ComponentSource({ name }: ComponentSourceProps) {
  const item = await getRegistryItem(name);
  const files = item?.files ?? [];

  if (!item || files.length === 0) {
    return (
      <p className="text-fd-muted-foreground text-sm">
        Component <code>{name}</code> not found in registry.
      </p>
    );
  }

  if (files.length === 1) {
    const file = files[0];
    const { language } = getRegistryFileMeta(file);
    const code = file.content ?? "";

    return (
      <ServerCodeBlock
        code={code}
        lang={language ?? "tsx"}
        themes={{
          dark: "github-dark",
          light: "github-light",
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {files.map((file) => {
        const { language, title } = getRegistryFileMeta(file);
        const code = file.content ?? "";

        return (
          <div key={file.path}>
            <p className="mb-1 font-medium text-fd-muted-foreground text-sm">
              {title}
            </p>
            <ServerCodeBlock
              code={code}
              lang={language ?? "tsx"}
              themes={{
                dark: "github-dark",
                light: "github-light",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
