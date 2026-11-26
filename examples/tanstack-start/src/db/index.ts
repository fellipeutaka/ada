import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to connect to the database");
}

export const db = drizzle(connectionString, { schema });
