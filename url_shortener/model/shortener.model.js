// import path from "path";
// import { readFile, writeFile } from "fs/promises";

// const DATA_FILE = path.join("data", "links.json");

// export const loadLinks = async () => {
//   try {
//     const data = await readFile(DATA_FILE, "utf-8");
//     return JSON.parse(data);
//   } catch (error) {
//     if (error.code === "ENOENT") {
//       await writeFile(DATA_FILE, JSON.stringify({}));
//       return {};
//     }
//     throw error;
//   }
// };

// export const saveLinks = async (links) => {
//   await writeFile(DATA_FILE, JSON.stringify(links, null, 2));
// };

//! MOngodb use:
// import { env } from "../config/env.js";
// import { dbClient } from "../config/db-client.js";

// const db = dbClient.db(env.MONGODB_DATABASE_NAME);
// const shortenerCollection = db.collection("shorteners");

// export const loadLinks = async () => {
//   return await shortenerCollection.find().toArray();
// };

// export const saveLinks = async (links) => {
//   return await shortenerCollection.insertOne(links);
// };

// export const getLinkByShortCode = async (shortCode) => {
//   return await shortenerCollection.findOne({ shortCode: shortCode });
// };

//! mySQL use:
// import mysql from "mysql2/promise";
import { db } from "../config/db-client.js";

export const loadLinks = async () => {
  const [rows] = await db.execute(`select * from short_links`);
  console.log(rows);
  return rows;
};

export const saveLinks = async ({ url, short_code }) => {
  const [result] = await db.execute(
    `insert into short_links(url, short_code) values(?, ?) `,
    [url, short_code]
  );
  return result;
};

export const getLinkByShortCode = async (short_code) => {
  const [rows] = await db.execute(
    `select * from short_links where short_code = ? `,
    [short_code]
  );
  // console.log("rows: " + rows.length);
  // console.log(rows[0]);

  if (rows.length > 0) {
    return rows[0];
  } else {
    return null;
  }
};
