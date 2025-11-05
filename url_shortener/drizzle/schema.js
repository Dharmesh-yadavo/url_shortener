import { relations } from "drizzle-orm";
import { timestamp, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const shortLinkTable = mysqlTable("short_link", {
  id: int().autoincrement().primaryKey(),
  shortCode: varchar("short_code", { length: 20 }).notNull(),
  url: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  user_Id: int("user_id")
    .notNull()
    .references(() => usersTable.id),
});

export const usersTable = mysqlTable("users", {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).unique().notNull(),
  password: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// A user can have a short link
export const userRelation = relations(shortLinkTable, ({ many }) => ({
  shortLink: many(shortLinkTable),
}));

// A shortlink belongs to a user
export const shortLinksRelation = relations(usersTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [shortLinkTable.user_Id], // foreign key
    references: [usersTable.id],
  }),
}));
