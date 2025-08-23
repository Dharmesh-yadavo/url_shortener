import mongoose from "mongoose";

//! Step 1: to connect to the mongodb server
try {
  await mongoose.connect("mongodb://127.0.0.1/mongoose_middleware");
  mongoose.set("debug", true);
} catch (error) {
  console.error(error);
  process.exit();
}

//! Step 2: Create Schema
const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true, min: 5 },
    //   createdAt: { type: Date, default: Date.now() },
    //   updatedAt: { type: Date, default: Date.now() },
  },
  {
    timestamps: true,
  }
);

//! We will use middleware here
// userSchema.pre(
//   ["updateOne", "updateMany", "findOneAndUpdate"],
//   function (next) {
//     this.set({ updatedAt: Date.now() });
//     next();
//   }
// );

//! Create a model
const Users = mongoose.model("user", userSchema);

// await Users.create({
//   name: "Dharmesh Yadav",
//   age: 21,
//   email: "yadavdharmesh@gmail.com",
// });

//! To Update the data:
await Users.updateOne(
  { email: "yadavdharmesh@gmail.com" },
  { $set: { age: 21 } }
);

await mongoose.connection.close();
