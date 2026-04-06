import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { PRIORITIES, STATUSES } from "../shared/tasks";
import { tasks } from "./schema";

config({ path: [".env.local", ".env"] });

const db = drizzle(process.env.DATABASE_URL!);

const TITLES = [
  "Fix bug in",
  "Implement",
  "Refactor",
  "Test",
  "Review",
  "Deploy",
  "Update",
  "Design",
];
const AREAS = [
  "auth",
  "dashboard",
  "API",
  "database",
  "UI",
  "pipeline",
  "docs",
  "config",
];

async function seed() {
  const baseDate = new Date("2026-01-15T00:00:00Z");

  const rows = Array.from({ length: 100 }, (_, i) => {
    const statuses = [STATUSES[i % STATUSES.length]];
    if (i % 3 === 0) {
      statuses.push(STATUSES[(i + 2) % STATUSES.length]);
    }

    return {
      id: `TASK-${String(i + 1).padStart(4, "0")}`,
      title: `Task ${i + 1}: ${TITLES[i % TITLES.length]} ${AREAS[i % AREAS.length]}`,
      priority: PRIORITIES[i % PRIORITIES.length],
      status: statuses,
      estimatedHours: Math.round((0.5 + ((i * 7 + 3) % 40)) * 10) / 10,
      createdAt: new Date(baseDate.getTime() + i * 21 * 60 * 60 * 1000),
    };
  });

  await db.delete(tasks);
  await db.insert(tasks).values(rows);

  console.log(`Seeded ${rows.length} tasks`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
