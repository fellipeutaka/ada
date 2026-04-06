import {
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const todos = pgTable("todos", {
  id: serial().primaryKey(),
  title: text().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const taskPriority = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const tasks = pgTable("tasks", {
  id: text().primaryKey(),
  title: text().notNull(),
  priority: taskPriority().notNull(),
  status: text().array().notNull(),
  estimatedHours: real("estimated_hours").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
