import { MongoClient } from "mongodb";

const client = new MongoClient("mongodb://127.0.0.1");
await client.connect();

const db = client.db("mongodb_nodejs_db");
const userCollection = db.collection("users");

//! Write / Add :
//* Insert one
// userCollection.insertOne({ name: "Jaidev Dabar", age: 12 });

//* Insert Many
// userCollection.insertMany([
//   { name: "Deepak", role: "frontend dev", age: 21 },
//   { name: "Dharmesh", role: "full stack dev ", age: 21 },
//   { name: "Aryan", role: ["full stack dev ", "ai-ml"], age: 21 },
// ]);

//! Read :
//* 1 way of doing
// const usersCursor = userCollection.find();
// console.log(usersCursor);

// for await (const user of usersCursor) {
//   console.log(user);
// }

//* 2 way
// const usersCursor = await userCollection.find().toArray();
// console.log(usersCursor);

const user = await userCollection.findOne({ name: "Aryan" });
// console.log(user);
// console.log(user._id.toHexString());

//! Update :
await userCollection.updateOne(
  { name: "Aryan" },
  { $set: { name: "Aryan Shrivastava" } }
);

//! Delete :
await userCollection.deleteOne({ name: "Dharmesh Yadav" });
console.log(`${result.deletedCount} documnets deleted. `);
