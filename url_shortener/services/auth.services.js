import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "../config/db.js";
import {
  passwordResetTokensTable,
  sessionTable,
  shortLinkTable,
  usersTable,
  verifyEmailTokensTable,
} from "../drizzle/schema.js";
import bcrypt from "bcryptjs";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRY,
  MILLISECONDS_PER_SECOND,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constants.js";
import { name } from "ejs";
import crypto from "crypto";
import { sendEmail } from "../lib/send-emails.js";
import path from "path";
import fs from "fs/promises";
import mjml2html from "mjml";
import ejs from "ejs";

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

const cerateSession = async (userId, { ip, userAgent }) => {
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

//fetchSessionByID
export const findSessionById = async (sessionId) => {
  const [session] = await db
    .select()
    .from(sessionTable)
    .where(eq(sessionTable.id, sessionId));

  return session;
};

//findUserById
export const findUserById = async (userId) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  return user;
};

// refreshTokens
export const refreshTokens = async (refreshToken) => {
  try {
    const decodedToken = verifyJWTToken(refreshToken);

    const currentSession = await findSessionById(decodedToken.sessionId);

    if (!currentSession) {
      //* !currentSession || !currentSession.valid but in seesionTable valid is not set
      throw new Error("Invalid session");
    }

    const user = await findUserById(currentSession.userId);

    if (!user) throw new Error("Invalid User");

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailValid: user.isEmailValid,
      sessionId: currentSession.id,
    };

    const newAccessToken = createAccessToken(userInfo);

    const newRefreshToken = createRefreshToken(currentSession.id);

    return { newAccessToken, newRefreshToken, user: userInfo };
  } catch (error) {
    console.log(error.message);
  }
};

// clearUserSession
export const celarUserSession = (sessionId) => {
  return db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
};

// authinticate user
export const authenticateUser = async ({ req, res, user, name, email }) => {
  // we need to create a sessions
  const session = await cerateSession(user.id, {
    ip: req.clientIp,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = createAccessToken({
    id: user.id,
    name: user.name || name,
    email: user.email || email,
    isEmailValid: false,
    sessionId: session.id,
  });

  const refreshToken = createRefreshToken(session.id);

  const baseConfig = { httpOnly: true, secure: true };

  res.cookie("access_token", accessToken, {
    ...baseConfig,
    maxAge: ACCESS_TOKEN_EXPIRY,
  });

  res.cookie("refresh_token", refreshToken, {
    ...baseConfig,
    maxAge: REFRESH_TOKEN_EXPIRY,
  });
};

// getAllShortLinks
export const getAllShortLinks = async (userId) => {
  return await db
    .select()
    .from(shortLinkTable)
    .where(eq(shortLinkTable.user_Id, userId));
};

// generateRandomToken

export const generateRandomToken = (digit = 8) => {
  const min = 10 ** (digit - 1);
  const max = 10 ** digit;

  return crypto.randomInt(min, max).toString();
};

// insertVerifyEmailToken
export const insertVerifyEmailToken = async ({ userId, token }) => {
  return db.transaction(async (tx) => {
    try {
      await tx
        .delete(verifyEmailTokensTable)
        .where(lt(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`));

      // Delete any existing tokens for this specific user
      await tx
        .delete(verifyEmailTokensTable)
        .where(eq(verifyEmailTokensTable.userId, userId));

      // Insert the new token
      await tx.insert(verifyEmailTokensTable).values({ userId, token });
    } catch (error) {
      // Log the error but don't expose details to the caller
      console.error("Failed to insert verification token:", error);
      throw new Error("Unable to create verification token");
    }
  });
};

// verifyEmailLink
// export const createVerifyEmailLink = ({ email, token }) => {
//   const uriEncodedEmail = encodeURIComponent(email);
//   return `${process.env.FRONTEND_URL}/verify-email-token?token=${token}&email=${uriEncodedEmail}`;
// };

//* The URL API in JavaScript provides an easy way to construct, manipulate,
//* and parse URLs without manual string concatenation. It ensures correct encoding,
//* readability, and security when handling URLs.

//? const url = new URL("https://example.com/profile?id=42&theme=dark");

//! console.log(url.hostname); // "example.com"
//! console.log(url.pathname); // "/profile"
//! console.log(url.searchParams.get("id")); // "42"
//! console.log(url.searchParams.get("theme")); // "dark"

//* 💡 Why Use the URL API?
//? ✅ Easier URL Construction – No need for manual ? and & handling.
//? ✅ Automatic Encoding – Prevents issues with special characters.
//? ✅ Better Readability – Clean and maintainable code.

export const createVerifyEmailLink = ({ email, token }) => {
  const url = new URL(`${process.env.FRONTEND_URL}/verify-email-token`);

  url.searchParams.append("token", token);
  url.searchParams.append("email", email);

  return url.toString();
};

// findVerificationEmailToken
// export const findVerificationEmailToken = async ({ token, email }) => {
//   const tokenData = await db
//     .select({
//       userId: verifyEmailTokensTable.userId,
//       token: verifyEmailTokensTable.token,
//       expiresAt: verifyEmailTokensTable.expiresAt,
//     })
//     .from(verifyEmailTokensTable)
//     .where(
//       and(
//         eq(verifyEmailTokensTable.token, token),
//         gte(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`)
//       )
//     );

//   // if no Token found, return null
//   if (!tokenData.length) {
//     return null;
//   }

//   const { userId } = tokenData[0];

//   const userData = await db
//     .select({
//       userId: usersTable.id,
//       email: usersTable.email,
//     })
//     .from(usersTable)
//     .where(usersTable.id, userId);

//   // if user not found, return null
//   if (!userData) {
//     return null;
//   }

//   console.log("userData: ", userData);

//   return {
//     userId: userData[0].id,
//     email: userData[0].email,
//     token: tokenData[0].token,
//     expiresAt: tokenData[0].expiresAt,
//   };
// };

export const findVerificationEmailToken = async ({ token, email }) => {
  console.log("token: ", token);

  return db
    .select({
      userId: usersTable.id,
      email: usersTable.email,
      token: verifyEmailTokensTable.token,
      expiresAt: verifyEmailTokensTable.expiresAt,
    })
    .from(verifyEmailTokensTable)
    .where(
      and(
        eq(verifyEmailTokensTable.token, token),
        eq(usersTable.email, email),
        gte(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`)
      )
    )
    .innerJoin(usersTable, eq(verifyEmailTokensTable.userId, usersTable.id));
};

// /verifyUserEmailAndUpdate
export const verifyUserEmailAndUpdate = async (email) => {
  return db
    .update(usersTable)
    .set({ isEmailValid: true })
    .where(eq(usersTable.email, email));
};

//clearVerifyEmailTokens
export const clearVerifyEmailTokens = async (userId) => {
  return await db
    .delete(verifyEmailTokensTable)
    .where(eq(verifyEmailTokensTable.userId, userId));
};

// sendNewVerifyEmailLink
export const sendNewVerifyEmailLink = async ({ userId, email }) => {
  const randomToken = generateRandomToken();

  await insertVerifyEmailToken({ userId: userId, token: randomToken });

  const verifyEmailLink = createVerifyEmailLink({
    email: email,
    token: randomToken,
  });

  // 1: to get the file data
  const mjmlTemplate = await fs.readFile(
    path.join(import.meta.dirname, "..", "emails", "verify-email.mjml"),
    "utf-8"
  );

  // to replace the placeholders with the actual values
  const filledTemplate = ejs.render(mjmlTemplate, {
    code: randomToken,
    link: verifyEmailLink,
  });

  // to convert mjml to html
  const htmlOutput = mjml2html(filledTemplate).html;

  sendEmail({
    to: email,
    subject: "Verify your email",
    html: htmlOutput,
  }).catch(console.error);
};

// updateUserByName
export const updateUserByName = async ({ userId, name }) => {
  return await db
    .update(usersTable)
    .set({ name: name })
    .where(eq(usersTable.id, userId));
};

//updateUserPassword
export const updateUserPassword = async ({ userId, newPassword }) => {
  const newHashPassword = await hashPassword(newPassword);

  return await db
    .update(usersTable)
    .set({ password: newHashPassword })
    .where(eq(usersTable.id, userId));
};

// /findUserByEmail
export const findUserByEmail = async (email) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  return user;
};

//todo steps
//1: random token ✅
// 2: convert into hash token ✅
// 3: clear the user prev. data - delete ✅
// 4: now we need to insert userid, hashToken ✅
// 5: return the link (create the link ) ✅

export const createResetPasswordLink = async ({ userId }) => {
  const randomToken = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(randomToken)
    .digest("hex");

  await db
    .delete(passwordResetTokensTable)
    .where(eq(passwordResetTokensTable.userId, userId));

  await db.insert(passwordResetTokensTable).values({ userId, tokenHash });

  return `${process.env.FRONTEND_URL}/reset-password/${randomToken}`;
};

// getResetPasswordToken
export const getResetPasswordToken = async (token) => {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const [data] = await db
    .select()
    .from(passwordResetTokensTable)
    .where(
      and(
        eq(passwordResetTokensTable.tokenHash, tokenHash),
        gte(passwordResetTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`)
      )
    );

  return data;
};
