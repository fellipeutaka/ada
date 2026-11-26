import { createEnv } from "@t3-oss/env-core";
import { url } from "zod/mini";

export const env = createEnv({
  server: {
    DATABASE_URL: url({
      error: "DATABASE_URL must be a valid Postgres connection string",
      pattern: /^postgres(?:ql)?:\/\/.*:.*@.*:\d{1,5}\/.*$/u,
    }),
  },
  client: {},
  clientPrefix: "VITE_",
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
