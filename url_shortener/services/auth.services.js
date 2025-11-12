import { eq, lt } from "drizzle-orm";
import { db } from "../config/db.js";
import {
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
  await db
    .delete(verifyEmailTokensTable)
    .where(lt(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`));
  return await db.insert(verifyEmailTokensTable).values({ userId, token });
};

// verifyEmailLink
export const createVerifyEmailLink = ({ email, token }) => {
  const uriEncodedEmail = encodeURIComponent(email);
  return `${process.env.FRONTEND_URL}/verify-email-token?token=${token}&email=${uriEncodedEmail}`;
};
