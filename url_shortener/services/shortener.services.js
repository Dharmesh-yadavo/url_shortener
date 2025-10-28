import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

export const loadLinks = async () => {
  //   const [rows] = await db.execute(`select * from short_links`);
  //   console.log(rows);
  //   return rows;

  const allShortLinks = await prisma.shortLink.findMany();
  return allShortLinks;
};

export const saveLinks = async ({ url, shortCode }) => {
  //   const [result] = await db.execute(
  //     `insert into short_links(url, short_code) values(?, ?) `,
  //     [url, short_code]
  //   );
  //   return result;

  const newShortLink = await prisma.shortLink.create({
    data: { shortCode: shortCode, url: url },
  });
  return newShortLink;
};

export const getLinkByShortCode = async (shortcode) => {
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

  const shortLink = await prisma.shortLink.findUnique({
    where: { shortCode: shortcode },
  });
  return shortLink;
};
