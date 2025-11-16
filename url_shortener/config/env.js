// Manual way:
// export const PORT = isNaN(process.env.PORT) ? 3000 : parseInt(process.env.PORT);

import { z, ZodError } from "zod";

// const ageSchema = z.number().min(18).max(100).int();
// const userAge = 19;

// const parsedUserAge = ageSchema.parse(userAge);
// console.log(parsedUserAge);
//! here you can individual access only data, error, success
// const { data, error, success } = ageSchema.safeParse(userAge);
// console.log(data);
// console.log(error);
// console.log(success);

// try {
//   const parsedUserAge = ageSchema.parse(userAge);
//   console.log(parsedUserAge); // Success case
// } catch (error) {
//   //! instanceof is a JavaScript operator used to check if an object
//   //! is an instance of a specific class or constructor.
//   if (error instanceof ZodError) {
//     console.log(error.issues[0].message); // Display error message only
//   } else {
//     console.log("Unexpected error:", error);
//   }
// }

// //! For env
// const portSchema = z.coerce.number().min(1).max(65535).default(3000);
// export const PORT = portSchema.parse(process.env.PORT);

//! Mongodb changes:
// export const env = z
//   .object({
//     // PORT: z.coerce.number().default(3000),
//     MONGODB_URI: z.string(),
//     MONGODB_DATABASE_NAME: z.string(),
//     MONGOOSE_URI: z.string(),
//   })
//   .parse(process.env);

const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  FRONTEND_URL: z.string().url().trim().min(1),
});

export const env = envSchema.parse(process.env);
