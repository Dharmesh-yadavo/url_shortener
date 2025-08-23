import mongoose from "mongoose";

//! Step 1: to connect to the mongodb server
try {
  await mongoose.connect("mongodb://127.0.0.1/mongoose_database");
  mongoose.set("debug", true);
} catch (error) {
  console.error(error);
  process.exit();
}

//! Step 2: Create Schema
const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true, min: 5 },
  createdAt: { type: Date, default: Date.now() },
});

//! Create a model
const Users = mongoose.model("user", userSchema);

await Users.create({
  name: "Dharmesh Yadav",
  age: 21,
  email: "yadavdharmesh2306@gmail.com",
});
