import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const shortLinkTable = mysqlTable("short_link", {
  id: int().autoincrement().primaryKey(),
  shortCode: varchar("short_code", { length: 20 }).notNull(),
  url: varchar({ length: 255 }).notNull(),
});
