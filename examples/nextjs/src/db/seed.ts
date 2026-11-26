import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
import { PrismaClient } from "../generated/prisma/client";

config({ path: [".env.local", ".env"] });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
const STATUSES = [
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "done",
  "cancelled",
];

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
      priority: PRIORITIES[
        i % PRIORITIES.length
      ] as (typeof PRIORITIES)[number],
      status: statuses,
      estimatedHours: Math.round((0.5 + ((i * 7 + 3) % 40)) * 10) / 10,
      createdAt: new Date(baseDate.getTime() + i * 21 * 60 * 60 * 1000),
    };
  });

  await prisma.task.deleteMany();
  await prisma.task.createMany({ data: rows });

  console.log(`Seeded ${rows.length} tasks`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
