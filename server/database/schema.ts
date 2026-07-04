import {pgTable, serial, text, varchar} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: varchar("clerk_id", {length: 100}).unique().notNull(),
  firstName: varchar("first_name", {length: 20}).notNull(),
  lastName: varchar("last_name", {length: 20}).notNull(),
  email: varchar("email", {length: 50}).unique().notNull().notNull(),
  username: varchar("username", {length: 10}).unique().notNull().notNull(),
});
