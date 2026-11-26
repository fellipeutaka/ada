export interface Task {
  createdAt: Date;
  estimatedHours: number;
  id: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: Array<string>;
  title: string;
}

export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const STATUSES = [
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

const baseDate = new Date("2026-01-15T00:00:00Z");

export const tasks: Array<Task> = Array.from({ length: 100 }, (_, i) => {
  const statuses = [STATUSES[i % STATUSES.length] ?? STATUSES[0]];
  if (i % 3 === 0) {
    statuses.push(STATUSES[(i + 2) % STATUSES.length] ?? STATUSES[0]);
  }

  return {
    id: `TASK-${String(i + 1).padStart(4, "0")}`,
    title: `Task ${i + 1}: ${TITLES[i % TITLES.length]} ${AREAS[i % AREAS.length]}`,
    priority: PRIORITIES[i % PRIORITIES.length] ?? PRIORITIES[0],
    status: statuses,
    estimatedHours: Math.round((0.5 + ((i * 7 + 3) % 40)) * 10) / 10,
    createdAt: new Date(baseDate.getTime() + i * 21 * 60 * 60 * 1000),
  };
});
