import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: varchar("clerk_id", {length: 100}).unique().notNull(),
  firstName: varchar("first_name", {length: 20}),
  lastName: varchar("last_name", {length: 20}),
  email: varchar("email", {length: 50}).unique().notNull(),
  username: varchar("username", {length: 50}),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: varchar("title", {length: 100}).notNull(),
  description: text("description"),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
