import { relations, sql } from "drizzle-orm";
import {
  timestamp,
  text,
  int,
  mysqlTable,
  varchar,
  boolean,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

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

export const sessionTable = mysqlTable("sessions", {
  id: int().autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  userAgent: text("user_agent"),
  ip: varchar({ length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const verifyEmailTokensTable = mysqlTable("verify_email_token", {
  id: int().autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  token: varchar({ length: 8 }).notNull(),
  expiresAt: timestamp("expires_at")
    // The brackets inside sql`` is necessary here, otherwise you would get syntax error.
    .default(sql`(CURRENT_TIMESTAMP + INTERVAL 1 DAY)`)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

//passwordResetTokensTable
export const passwordResetTokensTable = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" })
    .unique(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at")
    .default(sql`(CURRENT_TIMESTAMP + INTERVAL 1 HOUR)`)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

//oauthAccountsTable
export const oauthAccountsTable = mysqlTable("oauth_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  provider: mysqlEnum("provider", ["google", "github"]).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 })
    .notNull()
    .unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersTable = mysqlTable("users", {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).unique().notNull(),
  password: varchar({ length: 255 }),
  avatarUrl: text("avatar_url"),
  isEmailValid: boolean("is_Email_Valid").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// A user can have a multiple short link
// A user can have a multiple sessionTable
export const userRelation = relations(shortLinkTable, ({ many }) => ({
  shortLink: many(shortLinkTable),
  sessions: many(sessionTable),
}));

// A shortlink belongs to a single user
export const shortLinksRelation = relations(usersTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [shortLinkTable.user_Id], // foreign key
    references: [usersTable.id],
  }),
}));

// A userId belongs to a single user
export const sessionsRelation = relations(usersTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionTable.userId], // foreign key
    references: [usersTable.id],
  }),
}));
