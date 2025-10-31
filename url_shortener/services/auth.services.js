import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { usersTable } from "../drizzle/schema.js";
import bcrypt from "bcryptjs";

export const getUserByEmail = async (email) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  return user;
};

export const createUser = async ({ name, email, hashedPassword }) => {
  return await db
    .insert(usersTable)
    .values({ name: name, email: email, password: hashedPassword })
    .$returningId();
};

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password, hashPassword) => {
  return await bcrypt.compare(password, hashPassword);
};
