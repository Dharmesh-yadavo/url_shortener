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
import { env } from "../config/env.js";
import { dbClient } from "../config/db-client.js";

const db = dbClient.db(env.MONGODB_DATABASE_NAME);
const shortenerCollection = db.collection("shorteners");

export const loadLinks = async () => {
  return await shortenerCollection.find().toArray();
};

export const saveLinks = async (links) => {
  return await shortenerCollection.insertOne(links);
};

export const getLinkByShortCode = async (shortCode) => {
  return await shortenerCollection.findOne({ shortCode: shortCode });
};
