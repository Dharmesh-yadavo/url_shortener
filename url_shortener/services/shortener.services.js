// import { PrismaClient } from "../generated/prisma/client.js";

// const prisma = new PrismaClient();

//! drizzle
import { count, desc, eq, sql } from "drizzle-orm";
import { db } from "../config/db.js";
import { shortLinkTable } from "../drizzle/schema.js";

export const loadLinks = async ({ userId, limit = 10, offset = 0 }) => {
  //   const [rows] = await db.execute(`select * from short_links`);
  //   console.log(rows);
  //   return rows;
  //! prisma
  // const allShortLinks = await prisma.shortLink.findMany();
  // return allShortLinks;
  //! drizzle
  const condition = eq(shortLinkTable.user_Id, userId);
  const shortLinks = await db
    .select()
    .from(shortLinkTable)
    .where(condition)
    .orderBy(desc(shortLinkTable.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(shortLinkTable)
    .where(condition);

  return { shortLinks, totalCount };
};

export const saveLinks = async ({ url, shortCode, userId }) => {
  //   const [result] = await db.execute(
  //     `insert into short_links(url, short_code) values(?, `?) `,
  //     [url, short_code]
  //   );
  //   return result;
  //! prisma
  // const newShortLink = await prisma.shortLink.create({
  //   data: { shortCode: shortCode, url: url },
  // });
  // return newShortLink;
  //! drizzle
  const [newShortLink] = await db.insert(shortLinkTable).values({
    url,
    shortCode,
    user_Id: userId,
  });
  return newShortLink;
};

export const getLinkByShortCode = async (shortCode) => {
  //   const [rows] = await db.execute(
  //     `select * from short_links where short_code = ? `,
  //     [short_code]
  //   );
  //   // console.log("rows: " + rows.length);
  //   // console.log(rows[0]);

  //   if (rows.length > 0) {
  //     return rows[0];
  //   } else {
  //     return null;
  //   }
  //! prisma
  // const shortLink = await prisma.shortLink.findUnique({
  //   where: { shortCode: shortcode },
  // });
  // return shortLink;
  //! drizzle
  const [results] = await db
    .select()
    .from(shortLinkTable)
    .where(eq(shortLinkTable.shortCode, shortCode));
  return results;
};

export const findShortLink = async (id) => {
  const [results] = await db
    .select()
    .from(shortLinkTable)
    .where(eq(shortLinkTable.id, id));
  return results;
};

export const editShortLink = async ({ id, url, shortCode }) => {
  return await db
    .update(shortLinkTable)
    .set({ url, shortCode })
    .where(eq(shortLinkTable.id, id));
};

export const deleteShortLink = async (id) => {
  await db.delete(shortLinkTable).where(eq(shortLinkTable.id, id));
};
