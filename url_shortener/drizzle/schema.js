import { timestamp, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const shortLinkTable = mysqlTable("short_link", {
  id: int().autoincrement().primaryKey(),
  shortCode: varchar("short_code", { length: 20 }).notNull(),
  url: varchar({ length: 255 }).notNull(),
});

export const usersTable = mysqlTable("users", {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).unique().notNull(),
  password: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
