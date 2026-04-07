import type { Task as PrismaTask } from "../generated/prisma/client";

export type Task = PrismaTask;

export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const STATUSES = [
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "done",
  "cancelled",
];
