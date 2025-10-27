// import { MongoClient } from "mongodb";
// import { env } from "./env.js";

// export const dbClient = new MongoClient(env.MONGODB_URI);

//! using mongoose
import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDb = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    mongoose.set("debug", true);
  } catch (error) {
    console.log(error);
    process.exit();
  }
};
