import {sql} from "drizzle-orm";
import {
  pgTable,
  pgPolicy,
  serial,
  text,
  varchar,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import {authenticatedRole} from "drizzle-orm/supabase";

const currentUserId = sql`(select nullif(current_setting('app.user_id', true), '')::int)`;

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    clerkId: varchar("clerk_id", {length: 100}).unique().notNull(),
    firstName: varchar("first_name", {length: 20}),
    lastName: varchar("last_name", {length: 20}),
    email: varchar("email", {length: 50}).unique().notNull(),
    username: varchar("username", {length: 50}),
  },
  () => [
    pgPolicy("users_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`"id" = ${currentUserId}`,
    }),
    pgPolicy("users_update_own", {
      for: "update",
      to: authenticatedRole,
      using: sql`"id" = ${currentUserId}`,
      withCheck: sql`"id" = ${currentUserId}`,
    }),
  ],
);

export const tasks = pgTable(
  "tasks",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    title: varchar("title", {length: 100}).notNull(),
    description: text("description"),
    completed: boolean("completed").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  () => [
    pgPolicy("tasks_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`"user_id" = ${currentUserId}`,
    }),
    pgPolicy("tasks_insert_own", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`"user_id" = ${currentUserId}`,
    }),
    pgPolicy("tasks_update_own", {
      for: "update",
      to: authenticatedRole,
      using: sql`"user_id" = ${currentUserId}`,
      withCheck: sql`"user_id" = ${currentUserId}`,
    }),
    pgPolicy("tasks_delete_own", {
      for: "delete",
      to: authenticatedRole,
      using: sql`"user_id" = ${currentUserId}`,
    }),
  ],
);
