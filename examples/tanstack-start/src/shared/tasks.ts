import type { tasks } from "../db/schema";

export type Task = typeof tasks.$inferSelect;

export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const STATUSES = [
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "done",
  "cancelled",
];
