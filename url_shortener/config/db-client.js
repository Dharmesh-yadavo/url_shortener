// import { MongoClient } from "mongodb";
// import { env } from "./env.js";

// export const dbClient = new MongoClient(env.MONGODB_URI);

//! using mongoose
// import mongoose from "mongoose";
// import { env } from "./env.js";

// export const connectDb = async () => {
//   try {
//     await mongoose.connect(env.MONGOOSE_URI);
//     // mongoose.set("debug", true);
//   } catch (error) {
//     console.log(error);
//     process.exit();
//   }
// };

//

//! using mySQL
// import mysql from "mysql2/promise";

// // connecting to mysql servers
// export const db = await mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "dharmesh@23",
//   database: "url_shortener",
// });
// console.log("mySQL connected successfully");
