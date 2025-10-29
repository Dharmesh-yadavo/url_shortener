// import { PrismaClient } from "../generated/prisma/client.js";

// const prisma = new PrismaClient();

//! drizzle
import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { shortLinkTable } from "../drizzle/schema.js";

export const loadLinks = async () => {
  //   const [rows] = await db.execute(`select * from short_links`);
  //   console.log(rows);
  //   return rows;
  //! prisma
  // const allShortLinks = await prisma.shortLink.findMany();
  // return allShortLinks;
  //! drizzle
  return await db.select().from(shortLinkTable);
};

export const saveLinks = async ({ url, shortCode }) => {
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
    url: url,
    shortCode: shortCode,
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
