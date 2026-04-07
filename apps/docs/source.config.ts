import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { z } from "zod";

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    async: true,
    schema: z.object({
      title: z.string().max(128),
      description: z.string().max(512),
      links: z
        .object({
          api: z.url(),
          docs: z.url(),
        })
        .partial()
        .optional(),
    }),
  },
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      inline: "tailing-curly-colon",
      themes: {
        dark: "github-dark",
        light: "github-light",
      },
    },
  },
});
