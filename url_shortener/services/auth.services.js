import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { sessionTable, usersTable } from "../drizzle/schema.js";
import bcrypt from "bcryptjs";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRY,
  MILLISECONDS_PER_SECOND,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constants.js";

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
  // return await bcrypt.hash(password, 10);
  return await argon2.hash(password);
};

export const comparePassword = async (password, hashPassword) => {
  // return await bcrypt.compare(password, hashPassword);
  return await argon2.verify(hashPassword, password);
};

// export const generateToken = ({ id, name, email }) => {
//   return jwt.sign({ id, name, email }, process.env.JWT_SECRET, {
//     expiresIn: "30d",
//   });
// };

export const cerateSession = async (userId, { ip, userAgent }) => {
  const [sessions] = await db
    .insert(sessionTable)
    .values({ userId, userAgent, ip })
    .$returningId();

  return sessions;
};

export const createAccessToken = ({ id, name, email, sessionId }) => {
  return jwt.sign({ id, name, email, sessionId }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND, // expiresIn: "15m",
  });
};

export const createRefreshToken = (sessionId) => {
  return jwt.sign({ sessionId }, process.env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND, //   expiresIn: "1w",
  });
};

// verify JWTToken
export const verifyJWTToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
